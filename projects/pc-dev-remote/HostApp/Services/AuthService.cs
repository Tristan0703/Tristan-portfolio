using System;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace HostApp.Services
{
    public sealed class AuthService : IDisposable
    {
        private readonly string _jwtSecret;
        private readonly TimeSpan _tokenExpiry = TimeSpan.FromHours(24);
        private readonly TimeSpan _pairingCodeExpiry = TimeSpan.FromMinutes(10);
        private readonly ConcurrentDictionary<string, PairingCode> _pairingCodes = new();
        private readonly ConcurrentDictionary<string, DeviceInfo> _devices = new();

        public AuthService()
        {
            _jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
                ?? throw new InvalidOperationException("JWT_SECRET environment variable not set. Generate with: openssl rand -base64 32");
            
            if (Encoding.UTF8.GetBytes(_jwtSecret).Length < 32)
                throw new InvalidOperationException("JWT_SECRET must be at least 32 characters (256 bits)");
        }

        public string GeneratePairingCode()
        {
            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString("D6");
            var expiry = DateTime.UtcNow.Add(_pairingCodeExpiry);
            _pairingCodes[code] = new PairingCode { Code = code, Expiry = expiry, Used = false };
            return code;
        }

        public PairingResult TryPair(string code)
        {
            if (string.IsNullOrWhiteSpace(code))
                return new PairingResult { Success = false, Error = "Missing pairing code" };

            if (!_pairingCodes.TryGetValue(code, out var pc))
                return new PairingResult { Success = false, Error = "Invalid pairing code" };

            if (pc.Used)
                return new PairingResult { Success = false, Error = "Pairing code already used" };

            if (DateTime.UtcNow > pc.Expiry)
            {
                _pairingCodes.TryRemove(code, out _);
                return new PairingResult { Success = false, Error = "Pairing code expired" };
            }

            // Mark as used
            pc.Used = true;
            _pairingCodes[code] = pc;

            // Generate device ID and token
            var deviceId = Guid.NewGuid().ToString("N");
            var token = GenerateToken(deviceId, "control");
            var expiresAt = DateTime.UtcNow.AddHours(24);

            _devices[deviceId] = new DeviceInfo { DeviceId = deviceId, PairedAt = DateTime.UtcNow, LastSeen = DateTime.UtcNow };

            return new PairingResult
            {
                Success = true,
                Token = GenerateToken(deviceId, "control"),
                DeviceId = deviceId,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        public ValidationResult ValidateToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return new ValidationResult { IsValid = false, Error = "Missing token" };

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtSecret);
                
                var validationParams = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1)
                };

                var principal = handler.ValidateToken(token, validationParams, out var validatedToken);
                var jwtToken = (JwtSecurityToken)validatedToken;

                var deviceId = principal.FindFirst("deviceId")?.Value ?? jwtToken.Id;
                var scope = principal.FindFirst("scope")?.Value ?? "control";

                return new ValidationResult
                {
                    IsValid = true,
                    DeviceId = deviceId,
                    Scope = scope
                };
            }
            catch (SecurityTokenExpiredException)
            {
                return new ValidationResult { IsValid = false, Error = "Token expired" };
            }
            catch (SecurityTokenException ex)
            {
                return new ValidationResult { IsValid = false, Error = $"Invalid token: {ex.Message}" };
            }
            catch (Exception ex)
            {
                return new ValidationResult { IsValid = false, Error = $"Token validation error: {ex.Message}" };
            }
        }

        public string GenerateToken(string deviceId, string scope)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("deviceId", deviceId),
                new Claim("scope", scope),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(24),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public void CleanupExpired()
        {
            var now = DateTime.UtcNow;
            foreach (var kvp in _pairingCodes)
            {
                if (kvp.Value.Expiry < now || kvp.Value.Used)
                    _pairingCodes.TryRemove(kvp.Key, out _);
            }
        }

        public void Dispose()
        {
            _pairingCodes.Clear();
        }

        private class PairingCode
        {
            public string Code { get; set; }
            public DateTime Expiry { get; set; }
            public bool Used { get; set; }
        }

        private class DeviceInfo
        {
            public string DeviceId { get; set; }
            public DateTime PairedAt { get; set; }
            public DateTime LastSeen { get; set; }
        }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public string DeviceId { get; set; }
        public string Scope { get; set; }
        public string Error { get; set; }
    }

    public class PairingResult
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public string Token { get; set; }
        public string DeviceId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}