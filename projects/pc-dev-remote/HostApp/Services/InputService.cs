// d:\Privatework\PCremote\HostApp\Services\InputService.cs - OS-level input INJECTION via user32 SendInput
//
// Takes host-pixel coordinates from the client and drives the real Windows mouse
// and keyboard. Coordinates are normalized per MOUSEEVENTF_ABSOLUTE (0..65535
// across the primary monitor) before injection - raw screen pixels are NOT valid
// for absolute SendInput.
//
// NOTE ON PRIVILEGES (UIPI): programmatic mouse/keyboard input is silently
// discarded when the target window is PROCESS ELEVATED but this process is not.
// If the remote session targets elevated windows, run the host AS ADMINISTRATOR;
// we log a warning at startup when elevation is missing.

using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace HostApp.Services
{
    public class InputService : IDisposable
    {
        // --- Constants ---
        private const int INPUT_MOUSE = 0;
        private const int INPUT_KEYBOARD = 1;

        private const uint MOUSEEVENTF_MOVE = 0x0001;
        private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const uint MOUSEEVENTF_LEFTUP = 0x0004;
        private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
        private const uint MOUSEEVENTF_RIGHTUP = 0x0010;
        private const uint MOUSEEVENTF_ABSOLUTE = 0x8000;

        // Explicit flags for keyboard injection. KEYEVENTF_KEYDOWN is 0 so it is
        // named here for clarity only; every injection carries one of these.
        private const uint KEYEVENTF_KEYDOWN = 0x0000;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const uint KEYEVENTF_UNICODE = 0x0004; // inject literal char via wScan

        private const int SM_CXSCREEN = 0;
        private const int SM_CYSCREEN = 1;

        // Input-Win32 virtual key codes for the keyboard subset we synthesize.
        private const ushort VK_SHIFT = 0x10;
        private const ushort VK_CONTROL = 0x11;
        private const ushort VK_MENU = 0x12;
        private const ushort VK_ESCAPE = 0x1B;
        private const ushort VK_BACK = 0x08;
        private const ushort VK_TAB = 0x09;
        private const ushort VK_SPACE = 0x20;
        private const ushort VK_RETURN = 0x0D;
        private const ushort VK_LEFT = 0x25;
        private const ushort VK_UP = 0x26;
        private const ushort VK_RIGHT = 0x27;
        private const ushort VK_DOWN = 0x28;
        private const ushort VK_HOME = 0x24;
        private const ushort VK_END = 0x23;
        private const ushort VK_PRIOR = 0x21; // PageUp
        private const ushort VK_NEXT = 0x22;  // PageDown
        private const ushort VK_INSERT = 0x2D;
        private const ushort VK_DELETE = 0x2E;
        private const ushort VK_CAPSLOCK = 0x14;
        private const ushort VK_NUMLOCK = 0x90;
        private const ushort VK_F1 = 0x70; // F1..F12 are contiguous

        // DOM KeyboardEvent.code values that are CONTROL keys (no literal char is
        // inserted for them, so they are only ever injected via their VK).
        private static readonly System.Collections.Generic.HashSet<string> _controlKeyCodes =
            new System.Collections.Generic.HashSet<string>(System.StringComparer.Ordinal)
            {
                "Enter", "Space", "Backspace", "Tab", "Escape", "CapsLock",
                "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown",
                "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight",
                "AltLeft", "AltRight", "MetaLeft", "MetaRight",
                "Home", "End", "PageUp", "PageDown", "Insert", "Delete", "NumLock",
                "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
            };

        private readonly bool _isElevated;

        // --- Win32 structs ---
        [StructLayout(LayoutKind.Sequential)]
        private struct MOUSEINPUT
        {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT
        {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct INPUTUNION
        {
            [FieldOffset(0)] public MOUSEINPUT mi;
            [FieldOffset(0)] public KEYBDINPUT ki;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public uint type;
            public INPUTUNION U;
        }

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        // Maps a character to a virtual-key code + modifier state. The high byte
        // of the returned short holds shift/ctrl/alt state (bit 0x01=shift,
        // 0x02=ctrl, 0x04=alt); the low byte is the VK. Returns -1 if the char
        // cannot be synthesized as a VK.
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern short VkKeyScanW(char ch);

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        private static extern int GetSystemMetrics(int nIndex);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr GetCurrentProcess();

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern bool OpenProcessToken(IntPtr process, uint desiredAccess, out IntPtr tokenHandle);

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern bool GetTokenInformation(IntPtr tokenHandle, int tokenInformationClass, IntPtr tokenInformation, uint tokenInformationLength, out uint returnLength);

        [DllImport("advapi32.dll", SetLastError = true)]
        private static extern bool CloseHandle(IntPtr handle);

        private const uint TOKEN_QUERY = 0x0008;
        private const int TokenElevation = 20; // TOKEN_INFORMATION_CLASS::TokenElevation

        public InputService()
        {
            _isElevated = DetectElevation();
            Console.WriteLine(_isElevated
                ? "[Input] Running as ADMINISTRATOR - SendInput can control elevated windows (UIPI satisfied)."
                : "[Input] WARNING: not running elevated. Windows UIPI will silently BLOCK mouse/keyboard injection into windows that run as Administrator. To control elevated apps, restart this host as Administrator.");
        }

        public async Task<bool> StartListeningAsync()
        {
            Console.WriteLine("[Input] Input injection service ready (user32.SendInput).");
            await Task.CompletedTask;
            return true;
        }

        // --- Pointer injection ---
        // inputType: 'mousemove' | 'mousedown' | 'mouseup' | 'click' | ... (host px).
        public bool InjectPointer(string inputType, int hostX, int hostY)
        {
            switch (inputType)
            {
                case "mousemove":
                    return MoveAbsolute(hostX, hostY);
                case "mousedown":
                case "touchstart":
                    MoveAbsolute(hostX, hostY);
                    return Button(MOUSEEVENTF_LEFTDOWN);
                case "mouseup":
                case "touchend":
                    MoveAbsolute(hostX, hostY);
                    return Button(MOUSEEVENTF_LEFTUP);
                case "click":
                    // A dedicated click: move, press, release.
                    MoveAbsolute(hostX, hostY);
                    bool down = Button(MOUSEEVENTF_LEFTDOWN);
                    bool up = Button(MOUSEEVENTF_LEFTUP);
                    return down && up;
                default:
                    Diagnostics.Debug($"[Input] Ignored unknown pointer inputType '{inputType}'.");
                    return false;
            }
        }

        // Moves the cursor to an absolute position on the PRIMARY monitor.
        // MOUSEEVENTF_ABSOLUTE expects 0..65535 across the whole screen, so raw
        // screen pixels MUST be normalized first.
        private bool MoveAbsolute(int hostX, int hostY)
        {
            int screenWidth = Math.Max(1, GetSystemMetrics(SM_CXSCREEN));
            int screenHeight = Math.Max(1, GetSystemMetrics(SM_CYSCREEN));

            uint normalizedX = Convert.ToUInt32(Math.Clamp(hostX * 65536L / screenWidth, 0, 65535));
            uint normalizedY = Convert.ToUInt32(Math.Clamp(hostY * 65536L / screenHeight, 0, 65535));

            return SendMouse((int)normalizedX, (int)normalizedY, MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE);
        }

        private bool Button(uint flag)
        {
            return SendMouse(0, 0, 0, flag);
        }

        private bool SendMouse(int dx, int dy, uint flags) => SendMouse(dx, dy, 0, flags);

        private bool SendMouse(int dx, int dy, uint mouseData, uint flags)
        {
            var input = new INPUT
            {
                type = INPUT_MOUSE,
                U = new INPUTUNION
                {
                    mi = new MOUSEINPUT
                    {
                        dx = dx,
                        dy = dy,
                        mouseData = mouseData,
                        dwFlags = flags,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };

            uint sent = SendInput(1, new[] { input }, Marshal.SizeOf<INPUT>());
            if (sent == 0)
            {
                int err = Marshal.GetLastWin32Error();
                Console.WriteLine($"[Input] SendInput FAILED (Win32 {err}) - likely UIPI/privilege blocking injection into the target window.");
                return false;
            }
            Diagnostics.Debug($"[Input] SendInput ok ({flags}) at normalized ({dx},{dy}).");
            return true;
        }

        // --- Keyboard injection ---
        // key:   browser KeyboardEvent.key ("a", "Enter", " ", "\t", ...). On
        //        mobile software keyboards the code is frequently "Unidentified",
        //        so the character itself is the reliable source of truth.
        // code:  browser KeyboardEvent.code ("KeyA", "Enter", "Space", ...).
        // keyUp: true = release (KEYEVENTF_KEYUP), false = press.
        public bool InjectKey(string key, string code, bool keyUp)
        {
            // 1) Prefer a literal printable character: VkKeyScan handles case,
            //    digits and layout-mapped symbols (incl. the correct shift state)
            //    in one call. This is the primary path for mobile keyboards.
            if (!string.IsNullOrEmpty(key) && key.Length == 1 && !char.IsControl(key[0]))
            {
                short scan = VkKeyScanW(key[0]);
                if (scan != -1)
                {
                    ushort vk = (ushort)(scan & 0xFF);
                    ushort modState = (ushort)((scan >> 8) & 0xFF);
                    return InjectVkWithModifiers(vk, modState, keyUp);
                }
            }

            // 2) Special keys (Enter/Backspace/Space/arrows/...) arrive with a real code.
            ushort codeVk = MapKeyboardCodeToVk(code);
            if (codeVk != 0)
            {
                bool ok = SendKey(codeVk, keyUp ? KEYEVENTF_KEYUP : KEYEVENTF_KEYDOWN);
                Diagnostics.Debug($"[Input] Key {(keyUp ? "up" : "down")}: code '{code}' (VK {codeVk}).");
                return ok;
            }

            // 3) Last resort: non-ASCII or otherwise unmappable printable char -
            //    inject the raw UTF-16 character via KEYEVENTF_UNICODE.
            if (!string.IsNullOrEmpty(key) && key.Length == 1)
            {
                return InjectUnicode(key[0], keyUp);
            }

            Diagnostics.Debug($"[Input] No mapping for key '{key}' / code '{code}'.");
            return false;
        }

        // Character-mapped injection with the shift/ctrl/alt state VkKeyScan
        // reported. Modifiers are pressed before the key and released after it so
        // a single char carries its own modifier context (e.g. uppercase 'A').
        private bool InjectVkWithModifiers(ushort vk, ushort modState, bool keyUp)
        {
            bool hasShift = (modState & 0x01) != 0;
            bool hasCtrl = (modState & 0x02) != 0;
            bool hasAlt = (modState & 0x04) != 0;

            bool ok = true;
            if (!keyUp)
            {
                if (hasShift) ok &= SendKey(VK_SHIFT, KEYEVENTF_KEYDOWN);
                if (hasCtrl) ok &= SendKey(VK_CONTROL, KEYEVENTF_KEYDOWN);
                if (hasAlt) ok &= SendKey(VK_MENU, KEYEVENTF_KEYDOWN);
                ok &= SendKey(vk, KEYEVENTF_KEYDOWN);
            }
            else
            {
                ok &= SendKey(vk, KEYEVENTF_KEYUP);
                if (hasShift) ok &= SendKey(VK_SHIFT, KEYEVENTF_KEYUP);
                if (hasCtrl) ok &= SendKey(VK_CONTROL, KEYEVENTF_KEYUP);
                if (hasAlt) ok &= SendKey(VK_MENU, KEYEVENTF_KEYUP);
            }
            Diagnostics.Debug($"[Input] Char '{ (keyUp ? "up" : "down") }' VK {vk} shift={hasShift} ctrl={hasCtrl} alt={hasAlt}.");
            return ok;
        }

        // Injects a raw UTF-16 character (KEYEVENTF_UNICODE) - bypasses the VK
        // table entirely and works for any layout/emoji.
        private bool InjectUnicode(char ch, bool keyUp)
        {
            uint flags = keyUp ? KEYEVENTF_KEYUP | KEYEVENTF_UNICODE : KEYEVENTF_UNICODE;
            var input = new INPUT
            {
                type = INPUT_KEYBOARD,
                U = new INPUTUNION
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = 0,
                        wScan = ch,
                        dwFlags = flags,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };

            uint sent = SendInput(1, new[] { input }, Marshal.SizeOf<INPUT>());
            if (sent == 0)
            {
                Console.WriteLine($"[Input] Unicode SendInput FAILED (Win32 {Marshal.GetLastWin32Error()}).");
                return false;
            }
            Diagnostics.Debug($"[Input] Unicode {(keyUp ? "up" : "down")}: U+{(int)ch:X4}.");
            return true;
        }

        private bool SendKey(ushort vk, uint flags)
        {
            var input = new INPUT
            {
                type = INPUT_KEYBOARD,
                U = new INPUTUNION
                {
                    ki = new KEYBDINPUT
                    {
                        wVk = vk,
                        wScan = 0,
                        dwFlags = flags,
                        time = 0,
                        dwExtraInfo = IntPtr.Zero
                    }
                }
            };

            uint sent = SendInput(1, new[] { input }, Marshal.SizeOf<INPUT>());
            if (sent == 0)
            {
                Console.WriteLine($"[Input] Keyboard SendInput FAILED (Win32 {Marshal.GetLastWin32Error()}).");
                return false;
            }
            return true;
        }

        // Maps a subset of DOM KeyboardEvent.code values to Win32 virtual-key codes.
        // Used for special/control keys; printable characters are handled by
        // VkKeyScanW in InjectKey instead.
        private static ushort MapKeyboardCodeToVk(string code)
        {
            if (string.IsNullOrEmpty(code)) return 0;

            if (code.Length == 4 && code.StartsWith("Key", StringComparison.Ordinal))
                return (ushort)code[3]; // KeyA..KeyZ
            if (code.Length == 6 && code.StartsWith("Digit", StringComparison.Ordinal))
                return code[5] == '0' ? (ushort)0x30 : (ushort)code[5]; // Digit0..Digit9

            switch (code)
            {
                case "Enter": return VK_RETURN;
                case "Space": return VK_SPACE;
                case "Backspace": return VK_BACK;
                case "Tab": return VK_TAB;
                case "Escape": return VK_ESCAPE;
                case "CapsLock": return VK_CAPSLOCK;
                case "NumLock": return VK_NUMLOCK;
                case "ArrowLeft": return VK_LEFT;
                case "ArrowUp": return VK_UP;
                case "ArrowRight": return VK_RIGHT;
                case "ArrowDown": return VK_DOWN;
                case "Home": return VK_HOME;
                case "End": return VK_END;
                case "PageUp": return VK_PRIOR;
                case "PageDown": return VK_NEXT;
                case "Insert": return VK_INSERT;
                case "Delete": return VK_DELETE;
                case "ShiftLeft":
                case "ShiftRight": return VK_SHIFT;
                case "ControlLeft":
                case "ControlRight": return VK_CONTROL;
                case "AltLeft":
                case "AltRight": return VK_MENU;
                default:
                    // F1..F12 (and F13..F24) are contiguous at VK_F1.
                    if (code.Length == 2 && code[0] == 'F'
                        && code[1] >= '1' && code[1] <= '9')
                    {
                        return (ushort)(VK_F1 + (code[1] - '1'));
                    }
                    if (code.Length == 3 && code[0] == 'F'
                        && code[1] == '1' && (code[2] == '0' || code[2] == '1' || code[2] == '2'))
                    {
                        return (ushort)(VK_F1 + (10 + code[2] - '0'));
                    }
                    return 0;
            }
        }

        // Determines whether the current process token is elevated (run as admin).
        private static bool DetectElevation()
        {
            try
            {
                IntPtr token = IntPtr.Zero;
                if (!OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, out token)) return false;
                try
                {
                    uint size;
                    var elevation = new byte[4];
                    if (!GetTokenInformation(token, TokenElevation, Marshal.UnsafeAddrOfPinnedArrayElement(elevation, 0), (uint)elevation.Length, out size))
                        return false;
                    return BitConverter.ToUInt32(elevation, 0) != 0;
                }
                finally
                {
                    CloseHandle(token);
                }
            }
            catch (Exception)
            {
                return false;
            }
        }

        public void Dispose()
        {
            Console.WriteLine("[Input] Input service disposed.");
        }
    }
}