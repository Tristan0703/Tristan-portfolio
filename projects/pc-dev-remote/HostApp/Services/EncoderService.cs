// d:\Privatework\PCremote\HostApp\Services\EncoderService.cs - Adaptive WebP frame pipeline + networking
//
// GOALS
//   - Drastically reduce the per-frame payload (was ~129KB JPEG) so the WebSocket
//     (and the client renderer) stops choking, which fixes the send-busy drops and
//     the resulting desync.
//   - Keep text razor-sharp when the user is reading, but cheap when they type/scroll.
//
// PIPELINE (per captured NATIVE frame):
//   1. Fast 24x16 perceptual signature -> if the screen is UNCHANGED and there is
//      no recent input, the frame is SKIPPED entirely (no encode, no send).
//   2. Adaptive bitrate: recent input (< 250ms) = MOTION mode -> low quality (~38)
//      and downscaled to a width cap; otherwise IDLE mode -> high quality (~88) at
//      a higher width cap so text/code snaps to clarity.
//   3. WebP lossy encode (ImageSharp); falls back to explicit-quality JPEG if the
//      WebP encoder fails for any reason.
//   4. Fire-and-forget send with AT MOST ONE frame in flight: if the previous send
//      is still draining the socket the new frame is DROPPED (the newest frame
//      always wins), so capture/encode never blocks on the network.

using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;

namespace HostApp.Services
{
    public class EncoderService
    {
        // --- Adaptive encode parameters (env-tunable) ---
        private const long MOTION = 1;
        private const long IDLE = 2;

        private readonly int _motionWidth = ReadEnvInt("PCR_MOTION_WIDTH", 1600);
        private readonly int _motionQuality = ReadEnvInt("PCR_MOTION_Q", 60);
        private readonly int _idleWidth = ReadEnvInt("PCR_IDLE_WIDTH", 1920);
        private readonly int _idleQuality = ReadEnvInt("PCR_IDLE_Q", 90);
        private readonly long _idleAfterMs = 250;

        private readonly NetbirdService _netbirdService;

        private long _encodedFrameCount;
        private long _sendSuccessCount;
        private long _sendFailCount;
        private long _droppedSendCount;
        private long _skippedUnchangedCount;
        private DateTime _lastStatsLog = DateTime.MinValue;
        private readonly object _statsLock = new object();

        // 1 when a WebSocket send is currently in flight, 0 otherwise.
        private int _inFlightSends;

        // --- Frame-change detection state ---
        private byte[] _previousSignature;
        private long _lastMode = 0;

        // --- Pooled scaling buffers ---
        private Bitmap _motionBuffer;
        private Bitmap _hqBuffer;

        /// <summary>Set by the coordinator whenever user input arrives (any type).</summary>
        public DateTime LastUserInputUtc { get; set; } = DateTime.MinValue;

        /// <summary>True when the last EncodeAndSendFrameAsync call skipped because the screen was unchanged while idle.</summary>
        public bool LastFrameSkippedIdle { get; private set; }

        public EncoderService(NetbirdService netbirdService)
        {
            _netbirdService = netbirdService ?? throw new ArgumentNullException(nameof(netbirdService));
        }

        // Encodes the given NATIVE frame (if it changed / is active) and starts a
        // detached send. Returns true if the frame was handed to the send pipeline.
        // Never awaits the network.
        public Task<bool> EncodeAndSendFrameAsync(Bitmap raw)
        {
            LastFrameSkippedIdle = false;

            if (raw == null)
            {
                Diagnostics.Debug("EncodeAndSendFrameAsync(): bitmap was null (capture produced no frame) - skipping.");
                return Task.FromResult(false);
            }

            if (!_netbirdService.HasConnectedClient)
            {
                Diagnostics.Debug("EncodeAndSendFrameAsync(): no client connected - frame skipped (not encoded).");
                return Task.FromResult(false);
            }

            // --- 1) Fast change detection against the previous frame ---
            byte[] signature = ComputeSignature(raw);
            bool changed = _previousSignature == null || SignatureDifference(signature, _previousSignature) > 8.0;
            _previousSignature = signature;

            bool active = (DateTime.UtcNow - LastUserInputUtc).TotalMilliseconds < _idleAfterMs;
            if (!changed && !active)
            {
                // Nothing changed and the user isn't interacting: do not waste
                // bandwidth or encode time on an identical frame.
                System.Threading.Interlocked.Increment(ref _skippedUnchangedCount);
                LastFrameSkippedIdle = true;
                Diagnostics.Debug("Frame skipped: screen unchanged while idle.");
                return Task.FromResult(false);
            }

            // --- 2) Adaptive bitrate: pick resolution + quality by motion state ---
            long mode = active ? MOTION : IDLE;
            if (mode != _lastMode)
            {
                Console.WriteLine(mode == MOTION
                    ? "[Encoder] MOTION mode (active) - low quality, low resolution, max FPS."
                    : "[Encoder] IDLE mode - high quality frame for clarity.");
                _lastMode = mode;
            }

            int targetWidth = (int)(mode == MOTION ? _motionWidth : _idleWidth);
            double quality = mode == MOTION
                ? _motionQuality
                : _idleQuality;

            Bitmap target = GetScaledBuffer(raw, targetWidth, mode == MOTION);

            // --- 3) Encode (WebP lossy, JPEG fallback) ---
            long frameNumber = System.Threading.Interlocked.Increment(ref _encodedFrameCount);
            byte[] encodedData;
            try
            {
                var sw = new System.Diagnostics.Stopwatch();
                sw.Start();
                encodedData = CompressFrame(target, quality);
                sw.Stop();
                Diagnostics.Debug($"Frame #{frameNumber} encoded: {encodedData.Length} bytes ({TargetOf(encodedData)} q{quality:F0} {target.Width}x{target.Height}) in {sw.Elapsed.TotalMilliseconds:F1} ms.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Encoder] ERROR compressing frame #{frameNumber}: {ex.Message}");
                return Task.FromResult(false);
            }

            // --- 4) Non-blocking send (drop if one is already in flight) ---
            bool handled = TryBeginFrameSend(encodedData);
            return Task.FromResult(handled);
        }

        private static string TargetOf(byte[] data)
        {
            if (data.Length >= 12 && data[0] == 'R' && data[1] == 'I' && data[2] == 'F' && data[3] == 'F')
                return "webp";
            if (data.Length >= 2 && data[0] == 0xFF && data[1] == 0xD8)
                return "jpeg";
            return "raw";
        }

        // Starts a detached send task, dropping the frame if another is in flight.
        private bool TryBeginFrameSend(byte[] encodedData)
        {
            if (System.Threading.Interlocked.CompareExchange(ref _inFlightSends, 1, 0) != 0)
            {
                System.Threading.Interlocked.Increment(ref _droppedSendCount);
                Diagnostics.Debug("Frame dropped: previous WebSocket send still in flight.");
                return false;
            }

            _ = Task.Run(async () =>
            {
                try
                {
                    bool sent = await _netbirdService.SendAsync(encodedData);
                    lock (_statsLock)
                    {
                        if (sent) _sendSuccessCount++; else _sendFailCount++;
                        LogSendStats();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Encoder] Send task error: {ex.Message}");
                }
                finally
                {
                    System.Threading.Interlocked.Exchange(ref _inFlightSends, 0);
                }
            });

            return true;
        }

        // Downscales raw into a pooled buffer at the given width, preserving aspect.
        private Bitmap GetScaledBuffer(Bitmap raw, int targetWidth, bool motion)
        {
            targetWidth = Math.Min(targetWidth, raw.Width);
            double scale = (double)targetWidth / raw.Width;
            int targetHeight = Math.Max(1, (int)Math.Round(raw.Height * scale));

            if (targetWidth == raw.Width && targetHeight == raw.Height)
            {
                return raw; // no scaling needed at all
            }

            ref Bitmap pool = ref motion ? ref _motionBuffer : ref _hqBuffer;

            if (pool == null || pool.Width != targetWidth || pool.Height != targetHeight)
            {
                pool?.Dispose();
                pool = new Bitmap(targetWidth, targetHeight, PixelFormat.Format32bppArgb);
            }

            using (var g = Graphics.FromImage(pool))
            {
                g.CompositingMode = CompositingMode.SourceCopy;
                g.InterpolationMode = InterpolationMode.Bilinear;
                g.DrawImage(raw, 0, 0, targetWidth, targetHeight);
            }
            return pool;
        }

        /// <summary>
        /// Encodes a bitmap as WebP lossy at the given quality (1-100), falling
        /// back to JPEG with explicit quality if WebP is unavailable.
        /// </summary>
        public static byte[] CompressFrame(Bitmap bitmap, double quality)
        {
            int q = Math.Max(1, Math.Min(100, (int)Math.Round(quality)));

            byte[] bgra = GetBgraBytes(bitmap, out int stride);
            if (bgra != null && stride == bitmap.Width * 4)
            {
                try
                {
                    using (var stream = new MemoryStream())
                    {
                        using (var image = SixLabors.ImageSharp.Image.LoadPixelData<Bgra32>(bgra, bitmap.Width, bitmap.Height))
                        {
                            image.SaveAsWebp(stream, new WebpEncoder
                            {
                                FileFormat = WebpFileFormatType.Lossy,
                                Quality = q,
                                // Method 0 = fastest libwebp preset. Default (4) costs
                                // ~100-300ms/frame, which would cap us at ~5FPS; speed
                                // over compression ratio for a live stream.
                                Method = 0,
                                EntropyPasses = 1,
                                SpatialNoiseShaping = 0,
                                NearLossless = false,
                            });
                        }
                        return stream.ToArray();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Encoder] WebP encode failed ({ex.Message}) - falling back to JPEG q{q}.");
                }
            }

            return EncodeJpegFallback(bitmap, q);
        }

        private static byte[] EncodeJpegFallback(Bitmap bitmap, int quality)
        {
            using (var stream = new MemoryStream())
            {
                var jpegCodec = System.Drawing.Imaging.ImageCodecInfo
                    .GetImageEncoders()
                    .FirstOrDefault(c => c.FormatID == ImageFormat.Jpeg.Guid);
                if (jpegCodec != null)
                {
                    using (var parameters = new EncoderParameters(1))
                    {
                        parameters.Param[0] = new EncoderParameter(Encoder.Quality, (long)quality);
                        bitmap.Save(stream, jpegCodec, parameters);
                    }
                }
                else
                {
                    bitmap.Save(stream, ImageFormat.Jpeg);
                }
                return stream.ToArray();
            }
        }

        // Copies the 32bppArgb pixel data into a contiguous BGRA byte[] (matches
        // ImageSharp's Bgra32 layout). Returns null if locking is impossible.
        private static byte[] GetBgraBytes(Bitmap bitmap, out int stride)
        {
            stride = 0;
            try
            {
                var rect = new System.Drawing.Rectangle(0, 0, bitmap.Width, bitmap.Height);
                var data = bitmap.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                try
                {
                    stride = data.Stride;
                    byte[] buffer = new byte[data.Stride * data.Height];
                    Marshal.Copy(data.Scan0, buffer, 0, buffer.Length);
                    return buffer;
                }
                finally
                {
                    bitmap.UnlockBits(data);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Encoder] Could not lock pixel data: {ex.Message}");
                return null;
            }
        }

        // --- Fast perceptual change detection ---
        // Samples a fixed 24x16 grid of luminance values from the frame and compares
        // with the previous signature. Roughly O(400) ptr reads per frame.
        private const int SigCols = 24;
        private const int SigRows = 16;

        private static byte[] ComputeSignature(Bitmap bitmap)
        {
            var signature = new byte[SigCols * SigRows];
            try
            {
                var rect = new System.Drawing.Rectangle(0, 0, bitmap.Width, bitmap.Height);
                var data = bitmap.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                try
                {
                    IntPtr scan0 = data.Scan0;
                    int stride = data.Stride;
                    for (int r = 0; r < SigRows; r++)
                    {
                        int srcY = r * bitmap.Height / SigRows;
                        for (int c = 0; c < SigCols; c++)
                        {
                            int srcX = c * bitmap.Width / SigCols;
                            int offset = srcY * stride + srcX * 4;
                            int b = Marshal.ReadByte(scan0, offset);
                            int g = Marshal.ReadByte(scan0, offset + 1);
                            int red = Marshal.ReadByte(scan0, offset + 2);
                            signature[r * SigCols + c] = (byte)((b * 11 + g * 16 + red * 5) >> 5);
                        }
                    }
                }
                finally
                {
                    bitmap.UnlockBits(data);
                }
            }
            catch (Exception)
            {
                // Locking failed (e.g. disposed): report "changed" so we never stall output.
                for (int i = 0; i < signature.Length; i++) signature[i] = 255;
            }
            return signature;
        }

        private static double SignatureDifference(byte[] a, byte[] b)
        {
            int count = Math.Min(a.Length, b.Length);
            int total = 0;
            for (int i = 0; i < count; i++)
            {
                int diff = a[i] - b[i];
                if (diff < 0) diff = -diff;
                total += diff;
            }
            return count > 0 ? (double)total / count : 0.0;
        }

        private void LogSendStats()
        {
            if ((DateTime.Now - _lastStatsLog).TotalSeconds < 10) return;
            _lastStatsLog = DateTime.Now;
            Console.WriteLine($"[Encoder] Frames encoded: {_encodedFrameCount} | sent OK: {_sendSuccessCount} | send failed: {_sendFailCount} | dropped (send busy): {_droppedSendCount} | skipped (unchanged): {_skippedUnchangedCount}");
            if (_droppedSendCount > 0)
            {
                Console.WriteLine("[Encoder] INFO: still dropping busy-send frames; lower PCR_MOTION_Q/WIDTH to shrink frames further.");
            }
        }

        private static int ReadEnvInt(string name, int fallback)
        {
            string raw = Environment.GetEnvironmentVariable(name);
            if (int.TryParse(raw, out var value) && value > 0) return value;
            return fallback;
        }
    }
}