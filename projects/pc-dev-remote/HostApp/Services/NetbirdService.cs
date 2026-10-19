// d:\Privatework\PCremote\HostApp\Services\NetbirdService.cs - Serves the web client and hosts the WebSocket stream over the NetBird mesh

using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Security;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace HostApp.Services
{
    public class NetbirdService : IDisposable
    {
        // Single port serves both the web client (HTTP) and the video stream (WebSocket /ws)
        public const int WebPort = 4173;

        // NetBird peers are allocated addresses from the CGNAT range 100.64.0.0/10
        private const long NetBirdStart = 0x64400000L; // 100.64.0.0
        private const long NetBirdEnd = 0x647FFFFFL;   // 100.127.255.255
        private const string FallbackMeshIP = "100.114.19.246";
        private const string WebSocketMagicGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

        private TcpListener _tcpListener;
        private WebSocket _activeWebSocket;
        private readonly object _sessionLock = new object();
        private readonly SemaphoreSlim _sendLock = new SemaphoreSlim(1, 1);
        private bool _isListening = false;
        private bool _wasConnected = false;
        private X509Certificate2 _serverCertificate;
        private bool _useSsl;
        private readonly AuthService _authService;
        private string _connectedDeviceId;

        // The local NetBird mesh IP this host binds to (auto-detected)
        public string LocalMeshIP { get; } = DetectMeshIP();

        public string PageUrl => $"{( _useSsl ? "https" : "http" )}://{LocalMeshIP}:{WebPort}/";

        public bool HasConnectedClient
        {
            get { lock (_sessionLock) return _activeWebSocket != null; }
        }

        public string ConnectedDeviceId
        {
            get { lock (_sessionLock) return _connectedDeviceId; }
        }

        public event Action<byte[]> DataReceived;
        public event Action ClientConnected;
        public event Action ClientDisconnected;

        public NetbirdService(AuthService authService = null)
        {
            _authService = authService ?? new AuthService();
        }

        public async Task<bool> StartListeningAsync()
        {
            if (_isListening) return true;

            try
            {
                _serverCertificate = LoadCertificate();
                _useSsl = _serverCertificate != null;

                if (_useSsl)
                {
                    Console.WriteLine($"[NetBird] Binding to mesh IP {LocalMeshIP}:{WebPort} (HTTPS + WSS)...");
                    Console.WriteLine("[NetBird] TLS certificate loaded successfully");
                }
                else
                {
                    Console.WriteLine($"[NetBird] Binding to mesh IP {LocalMeshIP}:{WebPort} (HTTP + WebSocket)...");
                    Console.WriteLine("[NetBird] WARNING: No SSL certificate provided - using HTTP for development");
                    Console.WriteLine("[NetBird] Set SSL_CERT_PATH and SSL_CERT_PASSWORD env vars to enable HTTPS/WSS");
                }

                _tcpListener = new TcpListener(IPAddress.Parse(LocalMeshIP), WebPort);
                _tcpListener.Start();
                _isListening = true;

                Console.WriteLine($"[NetBird] Web client available at {PageUrl}");
                Console.WriteLine($"[NetBird] WebSocket endpoint ready at /ws ({(_useSsl ? "wss" : "ws")})");
                Console.WriteLine("[NetBird] NOTE: transport is WebSocket + WebP frame push (NOT WebRTC); the mobile client renders frames to a <canvas>.");
                _ = AcceptLoopAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Failed to start listener: {ex.Message}");
                Console.WriteLine($"[NetBird] Tried to bind {LocalMeshIP}:{WebPort}. This usually means the NetBird interface is not up or the mesh IP is not assigned.");
                Console.WriteLine("[NetBird] Fixes: 1) ensure `netbird status` shows Connected; 2) or set the address explicitly with the PCR_REMOTE_IP environment variable.");
                return false;
            }
        }

        private async Task AcceptLoopAsync()
        {
            while (_isListening)
            {
                try
                {
                    var client = await _tcpListener.AcceptTcpClientAsync();
                    _ = HandleClientAsync(client);
                }
                catch (ObjectDisposedException) { break; }
                catch (Exception ex) { Console.WriteLine($"[NetBird] Accept error: {ex.Message}"); }
            }
        }

        private async Task HandleClientAsync(TcpClient client)
        {
            Stream stream = client.GetStream();
            SslStream sslStream = null;

            try
            {
                if (_useSsl && _serverCertificate != null)
                {
                    sslStream = new SslStream(stream, false);
                    try
                    {
                        await sslStream.AuthenticateAsServerAsync(_serverCertificate, false, System.Security.Authentication.SslProtocols.Tls12 | System.Security.Authentication.SslProtocols.Tls13, false);
                        stream = sslStream;
                        Console.WriteLine($"[NetBird] TLS handshake completed for {client.Client.RemoteEndPoint}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[NetBird] TLS handshake failed: {ex.Message}");
                        return;
                    }
                }

                using (client)
                using (sslStream)
                {
using (var headerTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(30)))
                {
                    var request = await ReadHttpRequestAsync(stream, headerTimeout.Token);
                    if (request == null)
                    {
                        await WriteHttpResponseAsync(stream, 400, "Bad Request", null);
                        return;
                    }

                    // Handle API endpoints
                    if (request.Target.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
                    {
                        await HandleApiRequestAsync(stream, request);
                        return;
                    }

                    // Handle pairing page
                    if (string.Equals(request.Target, "/pair.html", StringComparison.OrdinalIgnoreCase))
                    {
                        await ServePairingPageAsync(stream);
                        return;
                    }

                    // Redirect HTTP to HTTPS if SSL is enabled
                    if (_useSsl && !request.IsWebSocketUpgrade && request.Method == "GET")
                    {
                        // Check if the request came over HTTP (we can infer from the lack of TLS on stream)
                        // Since we're already on TLS, we just serve normally. The redirect would be for plain HTTP on a different port.
                        // For single-port setup, we serve HTTPS content directly.
                    }

                    if (request.IsWebSocketUpgrade)
                    {
                        await HandleWebSocketAsync(client, stream, request);
                    }
                    else
                    {
                        await ServeStaticAsync(stream, request.Target);
                    }
                }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Connection error: {ex.Message}");
            }
        }

        // Reads exactly up to the end of the HTTP header block (byte by byte, so no
        // bytes from a WebSocket frame are consumed early).
        private static async Task<HttpRequest> ReadHttpRequestAsync(Stream stream, CancellationToken token)
        {
            const int maxHeaderBytes = 65536;
            var buffer = new MemoryStream();
            var single = new byte[1];
            byte[] tail = new byte[4];
            int tailLen = 0;

            while (buffer.Length < maxHeaderBytes)
            {
                int n = await stream.ReadAsync(single, 0, 1, token);
                if (n == 0) return null;

                byte value = single[0];
                buffer.WriteByte(value);

                if (tailLen < 4) tail[tailLen++] = value;
                else
                {
                    tail[0] = tail[1]; tail[1] = tail[2]; tail[2] = tail[3]; tail[3] = value;
                    if (tail[0] == (byte)'\r' && tail[1] == (byte)'\n' && tail[2] == (byte)'\r' && tail[3] == (byte)'\n')
                        break;
                }
            }

            if (buffer.Length >= maxHeaderBytes) return null;
            return HttpRequest.Parse(Encoding.UTF8.GetString(buffer.ToArray()));
        }

        private async Task HandleWebSocketAsync(TcpClient client, Stream stream, HttpRequest request)
        {
            // Extract token from query string or Authorization header
            string token = null;
            var target = request.Target;
            var queryStart = target.IndexOf('?');
            if (queryStart >= 0)
            {
                var query = target.Substring(queryStart + 1);
                var pairs = query.Split('&');
                foreach (var pair in pairs)
                {
                    var kv = pair.Split('=');
                    if (kv.Length == 2 && kv[0].Equals("token", StringComparison.OrdinalIgnoreCase))
                    {
                        token = Uri.UnescapeDataString(kv[1]);
                        break;
                    }
                }
            }

            // Also check Authorization header
            if (string.IsNullOrEmpty(token) && request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                if (authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    token = authHeader.Substring("Bearer ".Length).Trim();
                }
            }

            if (string.IsNullOrEmpty(token))
            {
                await WriteHttpResponseAsync(stream, 401, "Unauthorized", "Missing authentication token");
                return;
            }

            var validationResult = _authService.ValidateToken(token);
            if (!validationResult.IsValid)
            {
                await WriteHttpResponseAsync(stream, 401, "Unauthorized", validationResult.Error ?? "Invalid token");
                return;
            }

            if (!request.Headers.TryGetValue("Sec-WebSocket-Key", out var key))
            {
                await WriteHttpResponseAsync(stream, 400, "Bad Request", "Missing Sec-WebSocket-Key");
                return;
            }

            var accept = Convert.ToBase64String(
                SHA1.HashData(Encoding.UTF8.GetBytes(key + WebSocketMagicGuid)));

            var handshake = "HTTP/1.1 101 Switching Protocols\r\n" +
                            "Upgrade: websocket\r\n" +
                            "Connection: Upgrade\r\n" +
                            "Sec-WebSocket-Accept: " + accept + "\r\n\r\n";
            var handshakeBytes = Encoding.UTF8.GetBytes(handshake);
            await stream.WriteAsync(handshakeBytes, 0, handshakeBytes.Length);
            await stream.FlushAsync();

            var ws = WebSocket.CreateFromStream(stream, isServer: true, null, TimeSpan.FromSeconds(20));

            // Single-viewer semantics: replace any existing client (switching devices just opens the page)
            WebSocket previous;
            lock (_sessionLock)
            {
                previous = _activeWebSocket;
                _activeWebSocket = ws;
                _connectedDeviceId = validationResult.DeviceId;
            }
            if (previous != null)
            {
                try { await previous.CloseAsync(WebSocketCloseStatus.NormalClosure, "replaced", CancellationToken.None); } catch { }
                try { previous.Dispose(); } catch { }
            }

            Console.WriteLine($"[NetBird] Client connected from {client.Client.RemoteEndPoint} (device: {validationResult.DeviceId}, scope: {validationResult.Scope})");
            ClientConnected?.Invoke();

            try
            {
                var receiveBuffer = new byte[8192];
                while (_isListening)
                {
                    using (var message = new MemoryStream())
                    {
                        WebSocketReceiveResult result;
                        do
                        {
                            result = await ws.ReceiveAsync(new ArraySegment<byte>(receiveBuffer), CancellationToken.None);
                            if (result.MessageType == WebSocketMessageType.Close) break;
                            message.Write(receiveBuffer, 0, result.Count);
                        } while (!result.EndOfMessage);

                        if (result.MessageType == WebSocketMessageType.Close) break;

                        var data = message.ToArray();
                        if (data.Length > 0) DataReceived?.Invoke(data);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Receive error: {ex.Message}");
            }
            finally
            {
                lock (_sessionLock)
                {
                    if (ReferenceEquals(_activeWebSocket, ws))
                    {
                        _activeWebSocket = null;
                        _connectedDeviceId = null;
                    }
                }
                try { ws.Dispose(); } catch { }
                ClientDisconnected?.Invoke();
                Console.WriteLine("[NetBird] Client disconnected");
            }
        }

        private async Task HandleApiRequestAsync(Stream stream, HttpRequest request)
        {
            if (request.Target.Equals("/api/pair", StringComparison.OrdinalIgnoreCase) && request.Method.Equals("POST", StringComparison.OrdinalIgnoreCase))
            {
                await HandlePairRequestAsync(stream, request);
            }
            else
            {
                await WriteHttpResponseAsync(stream, 404, "Not Found", "API endpoint not found");
            }
        }

        private async Task HandlePairRequestAsync(Stream stream, HttpRequest request)
        {
            // Read request body
            string body = "";
            if (request.Headers.TryGetValue("Content-Length", out var contentLengthStr) && int.TryParse(contentLengthStr, out var contentLength))
            {
                var buffer = new byte[contentLength];
                var totalRead = 0;
                while (totalRead < contentLength)
                {
                    var read = await stream.ReadAsync(buffer, totalRead, contentLength - totalRead);
                    if (read == 0) break;
                    totalRead += read;
                }
                body = Encoding.UTF8.GetString(buffer, 0, totalRead);
            }

            string code = null;
            try
            {
                using (var doc = JsonDocument.Parse(body))
                {
                    if (doc.RootElement.TryGetProperty("code", out var codeElement))
                    {
                        code = codeElement.GetString();
                    }
                }
            }
            catch (Exception)
            {
                await WriteHttpResponseAsync(stream, 400, "Bad Request", "Invalid JSON");
                return;
            }

            if (string.IsNullOrWhiteSpace(code))
            {
                await WriteHttpResponseAsync(stream, 400, "Bad Request", "Missing pairing code");
                return;
            }

            var result = _authService.TryPair(code.Trim());

            var response = new
            {
                success = result.Success,
                error = result.Error,
                token = result.Token,
                deviceId = result.DeviceId,
                expiresAt = result.ExpiresAt.ToString("o")
            };

            var json = JsonSerializer.Serialize(response);
            await WriteHttpResponseAsync(stream, result.Success ? 200 : 400, result.Success ? "OK" : "Bad Request", json);
        }

        private async Task ServePairingPageAsync(Stream stream)
        {
            var html = @"<!DOCTYPE html>
<html lang=""en"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>PCRemote - Device Pairing</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: #16213e; border-radius: 16px; padding: 40px; max-width: 400px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        h1 { text-align: center; margin-bottom: 8px; color: #00d9ff; font-size: 28px; }
        .subtitle { text-align: center; color: #888; margin-bottom: 32px; font-size: 14px; }
        .code-display { background: #0f0f23; border: 2px dashed #00d9ff; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; font-family: 'Courier New', monospace; font-size: 48px; letter-spacing: 8px; color: #00d9ff; user-select: all; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 8px; font-size: 14px; color: #aaa; }
        input[type=""text""] { width: 100%; padding: 16px; border: 2px solid #333; border-radius: 8px; background: #0f0f23; color: #fff; font-size: 18px; text-align: center; letter-spacing: 4px; transition: border-color 0.2s; }
        input[type=""text""]:focus { outline: none; border-color: #00d9ff; }
        button { width: 100%; padding: 16px; background: linear-gradient(135deg, #00d9ff, #0099cc); border: none; border-radius: 8px; color: #000; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.1s, box-shadow 0.2s; }
        button:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,217,255,0.3); }
        button:active { transform: translateY(0); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: #3d1a1a; border: 1px solid #ff4444; color: #ff6666; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; display: none; }
        .error.visible { display: block; }
        .success { background: #1a3d1a; border: 1px solid #44ff44; color: #66ff66; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; display: none; }
        .success.visible { display: block; }
        .info { font-size: 12px; color: #666; text-align: center; margin-top: 16px; }
        .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #333; border-top-color: #00d9ff; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-text { display: inline; }
        .loading .btn-text { display: none; }
        .loading .spinner { display: inline-block; }
    </style>
</head>
<body>
    <div class=""container"">
        <h1>PCRemote Pairing</h1>
        <p class=""subtitle"">Enter the 6-digit code displayed on your host device</p>
        
        <div class=""error"" id=""error""></div>
        <div class=""success"" id=""success""></div>
        
        <div class=""form-group"">
            <label for=""codeInput"">Pairing Code</label>
            <input type=""text"" id=""codeInput"" maxlength=""6"" placeholder=""000000"" autocomplete=""off"" />
        </div>
        
        <button id=""pairBtn"" class="""">
            <span class=""spinner""></span>
            <span class=""btn-text"">Pair Device</span>
        </button>
        
        <p class=""info"">Code expires in 10 minutes. Get a new code from the host application.</p>
    </div>

    <script>
        const codeInput = document.getElementById('codeInput');
        const pairBtn = document.getElementById('pairBtn');
        const errorDiv = document.getElementById('error');
        const successDiv = document.getElementById('success');

        codeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        codeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') pairBtn.click();
        });

        pairBtn.addEventListener('click', async () => {
            const code = codeInput.value.trim();
            if (code.length !== 6) {
                showError('Please enter a 6-digit code');
                return;
            }

            setLoading(true);
            hideMessages();

            try {
                const response = await fetch('/api/pair', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });

                const data = await response.json();

                if (data.success) {
                    showSuccess('Pairing successful! Redirecting...');
                    // Store token and redirect to main app
                    localStorage.setItem('pcremote_token', data.token);
                    localStorage.setItem('pcremote_deviceId', data.deviceId);
                    localStorage.setItem('pcremote_tokenExpiry', data.expiresAt);
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    showError(data.error || 'Pairing failed');
                }
            } catch (err) {
                showError('Network error: ' + err.message);
            } finally {
                setLoading(false);
            }
        });

        function showError(msg) {
            errorDiv.textContent = msg;
            errorDiv.classList.add('visible');
            successDiv.classList.remove('visible');
        }

        function showSuccess(msg) {
            successDiv.textContent = msg;
            successDiv.classList.add('visible');
            errorDiv.classList.remove('visible');
        }

        function hideMessages() {
            errorDiv.classList.remove('visible');
            successDiv.classList.remove('visible');
        }

        function setLoading(loading) {
            pairBtn.disabled = loading;
            if (loading) pairBtn.classList.add('loading');
            else pairBtn.classList.remove('loading');
        }

        // Auto-focus
        codeInput.focus();
    </script>
</body>
</html>";

            var body = Encoding.UTF8.GetBytes(html);
            var head = "HTTP/1.1 200 OK\r\n" +
                       "Content-Type: text/html; charset=utf-8\r\n" +
                       "Content-Length: " + body.Length + "\r\n" +
                       "Cache-Control: no-cache\r\n" +
                       "Connection: close\r\n\r\n";
            var headBytes = Encoding.UTF8.GetBytes(head);
            await stream.WriteAsync(headBytes, 0, headBytes.Length);
            await stream.WriteAsync(body, 0, body.Length);
            await stream.FlushAsync();
        }

        public async Task<bool> SendAsync(byte[] data)
        {
            if (data == null || data.Length == 0) return true;

            WebSocket ws;
            lock (_sessionLock) ws = _activeWebSocket;

            if (ws == null)
            {
                if (_wasConnected)
                {
                    Console.WriteLine("[NetBird] Client disconnected; stopping sends");
                    _wasConnected = false;
                }
                return false;
            }

            try
            {
                // Non-blocking: if another send is still draining the socket,
                // report this frame as not sent so the caller can drop it and
                // capture a fresh one (keeps latency low under backpressure).
                if (!await _sendLock.WaitAsync(0))
                {
                    Diagnostics.Debug("[NetBird] Send dropped: previous send still in flight (backpressure).");
                    return false;
                }
                try
                {
                    await ws.SendAsync(new ArraySegment<byte>(data), WebSocketMessageType.Binary, true, CancellationToken.None);
                }
                finally { _sendLock.Release(); }

                // --- Stream attachment confirmation ---
                if (!_wasConnected)
                {
                    Console.WriteLine($"[NetBird] First frame delivered to client - video stream attached and flowing ({data.Length} bytes).");
                }
                _wasConnected = true;
                Diagnostics.Debug($"[NetBird] Sent frame: {data.Length} bytes.");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Send error: {ex.Message}");
                return false;
            }
        }

        private async Task ServeStaticAsync(Stream stream, string target)
        {
            if (string.IsNullOrEmpty(target))
            {
                await WriteHttpResponseAsync(stream, 400, "Bad Request", null);
                return;
            }

            var root = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "wwwroot"));
            string relative = target.Split('?')[0].TrimStart('/');
            if (string.IsNullOrEmpty(relative)) relative = "index.html";
            if (relative.Contains(".."))
            {
                await WriteHttpResponseAsync(stream, 403, "Forbidden", null);
                return;
            }

            var full = Path.GetFullPath(Path.Combine(root, relative));
            if (!full.StartsWith(root, StringComparison.OrdinalIgnoreCase) || !File.Exists(full))
            {
                await WriteHttpResponseAsync(stream, 404, "Not Found", null);
                return;
            }

            string contentType = GetContentType(full);
            var body = await File.ReadAllBytesAsync(full);

            var head = "HTTP/1.1 200 OK\r\n" +
                       "Content-Type: " + contentType + "\r\n" +
                       "Content-Length: " + body.Length + "\r\n" +
                       "Cache-Control: no-cache\r\n" +
                       "Connection: close\r\n\r\n";
            var headBytes = Encoding.UTF8.GetBytes(head);
            await stream.WriteAsync(headBytes, 0, headBytes.Length);
            await stream.WriteAsync(body, 0, body.Length);
            await stream.FlushAsync();
        }

        private static async Task WriteHttpResponseAsync(Stream stream, int status, string reason, string body)
        {
            body = body ?? string.Empty;
            var contentBytes = Encoding.UTF8.GetBytes(body);
            var head = $"HTTP/1.1 {status} {reason}\r\n" +
                       "Content-Type: text/plain; charset=utf-8\r\n" +
                       "Content-Length: " + contentBytes.Length + "\r\n" +
                       "Connection: close\r\n\r\n";
            var headBytes = Encoding.UTF8.GetBytes(head);
            await stream.WriteAsync(headBytes, 0, headBytes.Length);
            await stream.WriteAsync(contentBytes, 0, contentBytes.Length);
            await stream.FlushAsync();
        }

        private static string GetContentType(string path)
        {
            switch (Path.GetExtension(path).ToLowerInvariant())
            {
                case ".html": return "text/html; charset=utf-8";
                case ".js": return "application/javascript; charset=utf-8";
                case ".css": return "text/css; charset=utf-8";
                case ".json": return "application/json";
                case ".webmanifest": return "application/manifest+json";
                case ".png": return "image/png";
                case ".jpg": case ".jpeg": return "image/jpeg";
                case ".svg": return "image/svg+xml";
                case ".ico": return "image/x-icon";
                case ".woff2": return "font/woff2";
                default: return "application/octet-stream";
            }
        }

        // Resolve the NetBird mesh IP: explicit override, else the first IPv4 in the
        // CGNAT range found on an active interface, else the fallback.
        public static string DetectMeshIP()
        {
            string overrideIp = Environment.GetEnvironmentVariable("PCR_REMOTE_IP");
            if (!string.IsNullOrWhiteSpace(overrideIp)) return overrideIp.Trim();

            try
            {
                foreach (var nic in NetworkInterface.GetAllNetworkInterfaces())
                {
                    if (nic.OperationalStatus != OperationalStatus.Up) continue;
                    foreach (var address in nic.GetIPProperties().UnicastAddresses)
                    {
                        if (address.Address.AddressFamily != AddressFamily.InterNetwork) continue;
                        var bytes = address.Address.GetAddressBytes();
                        long ip = ((long)bytes[0] << 24) | ((long)bytes[1] << 16) | ((long)bytes[2] << 8) | bytes[3];
                        if (ip >= NetBirdStart && ip <= NetBirdEnd)
                            return address.Address.ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Mesh IP detection failed: {ex.Message}");
            }

            return FallbackMeshIP;
        }

        public void Dispose()
        {
            _isListening = false;
            lock (_sessionLock)
            {
                try { _activeWebSocket?.Dispose(); } catch { }
                _activeWebSocket = null;
            }
            _tcpListener?.Stop();
            _sendLock.Dispose();
            _serverCertificate?.Dispose();
            _authService?.Dispose();
        }

        private X509Certificate2 LoadCertificate()
        {
            var certPath = Environment.GetEnvironmentVariable("SSL_CERT_PATH");
            var certPassword = Environment.GetEnvironmentVariable("SSL_CERT_PASSWORD");

            if (string.IsNullOrWhiteSpace(certPath))
            {
                return null;
            }

            if (!File.Exists(certPath))
            {
                Console.WriteLine($"[NetBird] Certificate file not found: {certPath}");
                return null;
            }

            try
            {
                var cert = new X509Certificate2(certPath, certPassword ?? "", X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.PersistKeySet | X509KeyStorageFlags.Exportable);
                Console.WriteLine($"[NetBird] Loaded certificate: {cert.Subject} (expires {cert.NotAfter})");
                return cert;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[NetBird] Failed to load certificate: {ex.Message}");
                return null;
            }
        }

        private sealed class HttpRequest
        {
            public string Method { get; set; }
            public string Target { get; set; }
            public Dictionary<string, string> Headers { get; } = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            public bool IsWebSocketUpgrade { get; set; }

            public static HttpRequest Parse(string raw)
            {
                var request = new HttpRequest();
                var lines = raw.Split(new[] { "\r\n" }, StringSplitOptions.None);
                if (lines.Length > 0)
                {
                    var first = lines[0].Split(' ');
                    if (first.Length >= 2)
                    {
                        request.Method = first[0];
                        request.Target = first[1];
                    }
                }

                for (int i = 1; i < lines.Length; i++)
                {
                    var line = lines[i];
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    int index = line.IndexOf(':');
                    if (index <= 0) continue;
                    var name = line.Substring(0, index).Trim();
                    var value = line.Substring(index + 1).Trim();
                    request.Headers[name] = value;
                }

                request.IsWebSocketUpgrade =
                    request.Headers.TryGetValue("Upgrade", out var upgrade) &&
                    upgrade.IndexOf("websocket", StringComparison.OrdinalIgnoreCase) >= 0 &&
                    request.Headers.ContainsKey("Sec-WebSocket-Key");

                return request;
            }
        }
    }
}