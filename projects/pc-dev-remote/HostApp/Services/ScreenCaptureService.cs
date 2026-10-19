// d:\Privatework\PCremote\HostApp\Services\ScreenCaptureService.cs
//
// Real desktop capture (GDI CopyFromScreen) of the host's PRIMARY monitor.
// - Resolution is read dynamically from the OS (no hardcoded sizes).
// - Returns the NATIVE raw frame; resolution/quality adaptivity for the wire is
//   the EncoderService's job (motion vs idle), so this stays a thin, fast GDI read.
// - Screen space exposed via NativeWidth/NativeHeight so the coordinator can map
//   client coordinates back to host pixels.
// - OS permission denials and headless/display-lock failures are caught and
//   logged with actionable messages.
//
// DXGI Desktop Duplication is the preferred long-term approach for performance;
// swap the strategy via PCR_CAPTURE=dxgi when that path is added.

using System;
using System.ComponentModel;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace HostApp.Services
{
    public class ScreenCaptureService : IDisposable
    {
        private const int SM_CXSCREEN = 0; // primary screen width
        private const int SM_CYSCREEN = 1; // primary screen height

        private readonly Rectangle _captureBounds; // full primary monitor region
        private Bitmap _raw;                       // pooled native-resolution buffer
        private long _frameCounter;
        private long _captureErrorCount;
        private DateTime _lastStatsLog = DateTime.MinValue;

        // Host screen space (native px) - used to map client input back to desktop px.
        public int NativeWidth => _captureBounds.Width;
        public int NativeHeight => _captureBounds.Height;

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int GetSystemMetrics(int nIndex);

        public ScreenCaptureService()
        {
            Console.WriteLine("[Capture] Initializing real display capture (GDI CopyFromScreen) on the primary monitor...");
            Diagnostics.Debug("ScreenCaptureService ctor: reading primary monitor metrics.");

            int nativeWidth = GetSystemMetrics(SM_CXSCREEN);
            int nativeHeight = GetSystemMetrics(SM_CYSCREEN);

            if (nativeWidth <= 0 || nativeHeight <= 0)
            {
                Console.WriteLine($"[Capture] WARNING: OS reported primary resolution {nativeWidth}x{nativeHeight} - is a display session available?");
                nativeWidth = Math.Max(nativeWidth, 1);
                nativeHeight = Math.Max(nativeHeight, 1);
            }

            _captureBounds = new Rectangle(0, 0, nativeWidth, nativeHeight);
            _raw = new Bitmap(nativeWidth, nativeHeight, PixelFormat.Format32bppArgb);

            Console.WriteLine($"[Capture] Primary monitor: {nativeWidth}x{nativeHeight} (native raw capture; encoder applies adaptive resolution/quality).");
        }

        // Captures a single raw frame of the primary monitor at NATIVE resolution.
        // The returned Bitmap is pool-owned (reused across frames) - callers must
        // NOT dispose it and must finish using it before the next CaptureScreen().
        public Bitmap CaptureScreen()
        {
            Diagnostics.Debug($"CaptureScreen() frame #{_frameCounter}: CopyFromScreen {_captureBounds.Width}x{_captureBounds.Height}...");

            try
            {
                EnsureBuffer();

                using (var g = Graphics.FromImage(_raw))
                {
                    g.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
                    g.CopyFromScreen(_captureBounds.Left, _captureBounds.Top, 0, 0, _captureBounds.Size, CopyPixelOperation.SourceCopy);
                }

                _frameCounter++;
                Diagnostics.Debug($"CaptureScreen() frame #{_frameCounter - 1} OK ({_captureBounds.Width}x{_captureBounds.Height}).");

                var now = DateTime.Now;
                if ((now - _lastStatsLog).TotalSeconds >= 15)
                {
                    _lastStatsLog = now;
                    Console.WriteLine($"[Capture] Live capture active: {_frameCounter} frames captured, {_captureErrorCount} errors.");
                }

                return _raw;
            }
            catch (Win32Exception ex)
            {
                _captureErrorCount++;
                bool accessDenied = ex.NativeErrorCode == 5; // ERROR_ACCESS_DENIED
                Console.WriteLine($"[Capture] ERROR #{_captureErrorCount}: screen capture failed (Win32 {ex.NativeErrorCode}): {ex.Message}");
                if (accessDenied)
                {
                    Console.WriteLine("[Capture] OS denied screen capture access - grant screen-capture permission (Settings > Privacy > Screen capture)");
                    Console.WriteLine("[Capture] or avoid capturing while a UAC secure desktop / elevated prompt is shown.");
                }
                else
                {
                    Console.WriteLine("[Capture] Could not grab the display buffer - is an interactive desktop available?");
                }
                return null;
            }
            catch (InvalidOperationException ex)
            {
                _captureErrorCount++;
                Console.WriteLine($"[Capture] ERROR #{_captureErrorCount}: display buffer unavailable: {ex.Message}");
                Console.WriteLine("[Capture] Likely a headless session or an RDP session that was disconnected - no display to capture.");
                return null;
            }
            catch (Exception ex)
            {
                _captureErrorCount++;
                Console.WriteLine($"[Capture] ERROR #{_captureErrorCount}: unexpected capture failure: {ex.Message}");
                return null;
            }
        }

        private void EnsureBuffer()
        {
            bool needsRecreate = _raw == null;
            if (!needsRecreate)
            {
                try
                {
                    needsRecreate = _raw.Width != _captureBounds.Width || _raw.Height != _captureBounds.Height;
                }
                catch (ObjectDisposedException)
                {
                    needsRecreate = true;
                }
            }

            if (needsRecreate)
            {
                _raw?.Dispose();
                _raw = new Bitmap(_captureBounds.Width, _captureBounds.Height, PixelFormat.Format32bppArgb);
            }
        }

        public void Dispose()
        {
            _raw?.Dispose();
            _raw = null;
            Console.WriteLine("[Capture] ScreenCaptureService disposed.");
        }
    }
}