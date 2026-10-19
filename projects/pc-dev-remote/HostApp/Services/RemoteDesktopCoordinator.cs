// d:\Privatework\PCremote\HostApp\Services\RemoteDesktopCoordinator.cs - Orchestrates all services and manages the remote desktop session lifecycle

using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Drawing;

namespace HostApp.Services
{
    public class RemoteDesktopCoordinator : IDisposable
    {
        private readonly NetbirdService _netbirdService;
        private readonly ScreenCaptureService _captureService;
        private readonly InputService _inputService;
        private readonly EncoderService _encoderService;
        private readonly AuthService _authService;
        private Task _captureLoopTask;
        private bool _isRunning = false;

        private readonly object _incomingLock = new object();
        private readonly Dictionary<string, long> _incomingKinds = new Dictionary<string, long>();
        private long _incomingTotal;
        private DateTime _lastIncomingLog = DateTime.MinValue;

        // --- Capture pacing (smoothness / CPU) ---
        // Caps the capture-encode loop at a steady target rate instead of
        // hammering the CPU with max fps (which spikes load and chokes the send
        // queue into hundreds of dropped frames). Tunable via PCR_TARGET_FPS.
        private readonly double _targetFps = ReadTargetFps();
        private readonly System.Diagnostics.Stopwatch _frameClock = new System.Diagnostics.Stopwatch();

        public RemoteDesktopCoordinator()
        {
            _authService = new AuthService();
            _netbirdService = new NetbirdService(_authService);
            _captureService = new ScreenCaptureService();
            _inputService = new InputService();
            _encoderService = new EncoderService(_netbirdService);
            
            // Wire up netbird events
            _netbirdService.ClientConnected += () =>
                Console.WriteLine("[Coordinator] Client connected - video stream will flow from the next captured frame.");
            _netbirdService.ClientDisconnected += () =>
                Console.WriteLine("[Coordinator] Client disconnected - new frames are dropped until a client reconnects.");
            _netbirdService.DataReceived += OnDataReceived;
        }

        // Main startup function for the entire application pipeline
        public async Task<bool> StartSessionAsync()
        {
            Console.WriteLine("--- Starting Remote Desktop Session Coordinator ---");
            
            // 1. Start NetBird listener on mesh IP
            if (!await _netbirdService.StartListeningAsync())
            {
                Console.WriteLine("FATAL: Could not start NetBird listener. Aborting session start.");
                return false;
            }

            // 2. Start Input Monitoring
            if (!await _inputService.StartListeningAsync())
            {
                Console.WriteLine("WARNING: Failed to start input monitoring, but continuing with capture.");
            }

            // 3. Start Screen Capture Loop
            _isRunning = true;
            _captureLoopTask = RunCaptureLoopAsync();

            Console.WriteLine($"\n✅ All services started! Web client available at {_netbirdService.PageUrl}");
            return true;
        }

        private async Task RunCaptureLoopAsync()
        {
            while (_isRunning)
            {
                try
                {
                    // No viewer attached: don't waste CPU on capture or JPEG.
                    if (!_netbirdService.HasConnectedClient)
                    {
                        await Task.Delay(50);
                        continue;
                    }

                    // Frame pacing: measure how long this capture+encode took and
                    // sleep the REMAINDER of the target frame interval. This keeps
                    // the loop at a steady ~_targetFps instead of maxing out; when
                    // the frame is skipped (idle) or dropped (send busy) we still
                    // pace the same so we never spin the CPU.
                    _frameClock.Restart();

                    // NOTE: the bitmap is pool-owned by ScreenCaptureService and
                    // must NOT be disposed here (it is reused across frames).
                    // EncodeAndSendFrameAsync encodes synchronously (before this
                    // loop runs again) and pushes the send to a background task,
                    // so the next capture is never blocked by the network. The
                    // encoder also SKIPS identical frames while idle.
                    var bitmap = _captureService.CaptureScreen();
                    if (bitmap == null)
                    {
                        await Task.Delay(100); // capture unavailable (headless/permission) - retry slowly
                        continue;
                    }

                    bool handled = await _encoderService.EncodeAndSendFrameAsync(bitmap);

                    // Throttle to the target interval regardless of handled/dropped
                    // outcome - steady cadence equals smooth, low-CPU streaming.
                    double elapsedMs = _frameClock.Elapsed.TotalMilliseconds;
                    double targetMs = 1000.0 / _targetFps;
                    double remainingMs = targetMs - elapsedMs;
                    if (remainingMs > 1)
                    {
                        await Task.Delay((int)remainingMs);
                    }
                    else if (!handled && _encoderService.LastFrameSkippedIdle)
                    {
                        // Screen is static and unattended: a light extra backoff
                        // keeps CPU quiet while still polling to notice changes.
                        await Task.Delay(50);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Coordinator] Capture loop error: {ex.Message}");
                    await Task.Delay(1000);
                }
            }
        }

        // Read target capture FPS from env (default 30), clamped to a sane range.
        private static double ReadTargetFps()
        {
            string raw = Environment.GetEnvironmentVariable("PCR_TARGET_FPS");
            if (int.TryParse(raw, out var fps) && fps >= 1 && fps <= 60) return fps;
            return 30.0;
        }

        private void OnDataReceived(byte[] data)
        {
            // Note: the 100-120 byte payloads arriving here are the client's INPUT EVENTS
            // (JSON such as mousemove/click), NOT WebRTC SDP offers or ICE candidates.
            // This app has no WebRTC signal channel - it streams WebSocket+JPEG frames down.
            LogIncomingPayload(data);
        }

        private void LogIncomingPayload(byte[] data)
        {
            string kind = "binary";
            string sample = "";
            try
            {
                string text = Encoding.UTF8.GetString(data);
                using (var doc = JsonDocument.Parse(text))
                {
                    kind = doc.RootElement.TryGetProperty("type", out var t) ? t.GetString() ?? "?" : "?";
                    string inputType = doc.RootElement.TryGetProperty("inputType", out var it) ? it.GetString() : null;
                    if (!string.IsNullOrEmpty(inputType)) kind = $"{kind}/{inputType}";

                    // The client reports coordinates in the SPACE OF THE FRAME IT
                    // RENDERED (data.x/.y, data.frameW/.frameH). Because the host's
                    // frame resolution is adaptive (motion vs idle), the host always
                    // rescales relative to the frame the user actually saw - this is
                    // the only correct mapping across frame-size changes.
                    if (!string.IsNullOrEmpty(inputType) && doc.RootElement.TryGetProperty("data", out var dataEl))
                    {
                        if (dataEl.TryGetProperty("x", out var xEl) && dataEl.TryGetProperty("y", out var yEl) &&
                            xEl.ValueKind == JsonValueKind.Number && yEl.ValueKind == JsonValueKind.Number)
                        {
                            double frameX = xEl.GetDouble();
                            double frameY = yEl.GetDouble();

                            double frameW = dataEl.TryGetProperty("frameW", out var wEl) && wEl.ValueKind == JsonValueKind.Number ? wEl.GetDouble() : _captureService.NativeWidth;
                            double frameH = dataEl.TryGetProperty("frameH", out var hEl) && hEl.ValueKind == JsonValueKind.Number ? hEl.GetDouble() : _captureService.NativeHeight;

                            int nativeW = Math.Max(1, _captureService.NativeWidth);
                            int nativeH = Math.Max(1, _captureService.NativeHeight);
                            int hostX = (int)Math.Round(Math.Clamp(frameX / Math.Max(1, frameW) * nativeW, 0, 65535));
                            int hostY = (int)Math.Round(Math.Clamp(frameY / Math.Max(1, frameH) * nativeH, 0, 65535));

                            Console.WriteLine($"[Input] '{inputType}' frame({frameX:F0},{frameY:F0}) in {frameW:F0}x{frameH:F0} -> host({hostX},{hostY}) on {nativeW}x{nativeH}");

                            // Real OS injection - not just logging.
                            bool injected = _inputService.InjectPointer(inputType, hostX, hostY);
                            Diagnostics.Debug(injected ? $"[Input] Injected {inputType} at host({hostX},{hostY})." : $"[Input] Failed to inject {inputType}.");

                            // Marks the user as ACTIVE so the encoder switches to
                            // motion mode (high FPS, low quality) for the next frames.
                            _encoderService.LastUserInputUtc = DateTime.UtcNow;
                        }
                        else
                        {
                            string code = dataEl.TryGetProperty("code", out var codeEl) && codeEl.ValueKind == JsonValueKind.String ? codeEl.GetString() : null;
                            string key = dataEl.TryGetProperty("key", out var keyEl) && keyEl.ValueKind == JsonValueKind.String ? keyEl.GetString() : null;
                            if (!string.IsNullOrEmpty(code) || !string.IsNullOrEmpty(key))
                            {
                                bool keyUp = string.Equals(inputType, "keyup", StringComparison.OrdinalIgnoreCase);
                                bool injected = _inputService.InjectKey(key, code, keyUp);
                                Diagnostics.Debug(injected ? $"[Input] Injected key {(keyUp ? "up" : "down")} key='{key}' code='{code}'." : $"[Input] Failed to inject key key='{key}' code='{code}'.");
                                _encoderService.LastUserInputUtc = DateTime.UtcNow;
                            }
                        }
                    }

                    sample = text.Length <= 120 ? text : text.Substring(0, 120) + "...";
                }
            }
            catch (Exception)
            {
                // Not JSON - could be a control/binary payload.
            }

            lock (_incomingLock)
            {
                _incomingTotal++;
                _incomingKinds.TryGetValue(kind, out var count);
                _incomingKinds[kind] = count + 1;
                bool isFirstKind = count == 0;

                if (isFirstKind || (DateTime.Now - _lastIncomingLog).TotalSeconds >= 10)
                {
                    _lastIncomingLog = DateTime.Now;
                    Console.WriteLine($"[NetBird] Inbound client payload: {data.Length} bytes -> kind '{kind}' (total inbound: {_incomingTotal})");
                    if (sample.Length > 0) Console.WriteLine($"[NetBird]   sample: {sample}");
                    Console.WriteLine("[NetBird]   These are client INPUT events (JSON) - no SDP/ICE will ever appear here because there is no WebRTC.");
                }
            }

            Diagnostics.Debug("[NetBird] Inbound raw: " + BitConverter.ToString(data, 0, Math.Min(24, data.Length)));
        }

        public void Dispose()
        {
            Console.WriteLine("--- Shutting down Remote Desktop Session ---");
            _isRunning = false;
            
            _captureLoopTask?.Wait(2000);
            _captureService?.Dispose();
            _inputService?.Dispose();
            _netbirdService?.Dispose();
            _authService?.Dispose();
        }
    }
}