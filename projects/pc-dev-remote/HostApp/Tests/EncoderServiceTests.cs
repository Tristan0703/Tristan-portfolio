using Xunit;
using System.Drawing;
using System.Net;
using System.Net.Sockets;
using HostApp.Services;

namespace HostApp.Tests
{
    public class EncoderServiceTests
    {
        [Fact]
        public void EncoderService_Constructor_WithNullNetbirdService_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new EncoderService(null));
        }

        [Fact]
        public async Task EncodeAndSendFrameAsync_WithNullBitmap_DoesNotThrow()
        {
            // Arrange
            var netbirdService = new NetbirdService();
            var encoder = new EncoderService(netbirdService);

            // Act & Assert
            await encoder.EncodeAndSendFrameAsync(null); // Should not throw
        }

        [Fact]
        public void CompressFrame_ReturnsWebPOrJpegBytes()
        {
            // Arrange
            using var bitmap = new Bitmap(100, 100);
            bitmap.SetPixel(5, 5, Color.Red);

            // Act
            var result = EncoderService.CompressFrame(bitmap, 75);

            // Assert - must be a real encoded image (WebP 'RIFF...WEBP' or JPEG SOI)
            Assert.NotNull(result);
            Assert.True(result.Length > 0);
            bool isWebp = result.Length >= 12
                && result[0] == (byte)'R' && result[1] == (byte)'I' && result[2] == (byte)'F' && result[3] == (byte)'F';
            bool isJpeg = result.Length >= 2 && result[0] == 0xFF && result[1] == 0xD8;
            Assert.True(isWebp || isJpeg, "Encoded frame must be WebP or JPEG with a recognized magic header.");
        }

        [Fact]
        public void CompressFrame_LowerQuality_ProducesSmallerOrEqualOutput()
        {
            // Arrange
            using var bitmap = new Bitmap(200, 200);

            // Act - fill with contrasting data so quality strongly affects size
            using (var g = System.Drawing.Graphics.FromImage(bitmap))
            {
                g.Clear(Color.White);
                using var brush = new SolidBrush(Color.Black);
                g.FillRectangle(brush, 0, 0, 200, 80);
            }

            var highQ = EncoderService.CompressFrame(bitmap, 90);
            var lowQ = EncoderService.CompressFrame(bitmap, 35);

            // Assert - a lower quality should never be larger than a high-quality frame
            Assert.True(lowQ.Length <= highQ.Length,
                $"Expected lower quality ({lowQ.Length} B) <= higher quality ({highQ.Length} B)");
        }
    }

    public class NetbirdServiceTests
    {
        [Fact]
        public void NetbirdService_DefaultConstructor_SetsValidMeshIP()
        {
            // Arrange & Act
            using var service = new NetbirdService();

            // Assert - mesh IP must be a resolvable IPv4 address
            Assert.True(IPAddress.TryParse(service.LocalMeshIP, out var ip));
            Assert.Equal(AddressFamily.InterNetwork, ip.AddressFamily);
        }

        [Fact]
        public void NetbirdService_PageUrl_UsesWebPort()
        {
            // Arrange & Act
            using var service = new NetbirdService();

            // Assert - the page URL uses the unified web/WebSocket port
            Assert.Contains($":{NetbirdService.WebPort}/", service.PageUrl);
        }

        [Fact]
        public void NetbirdService_Dispose_DoesNotThrow()
        {
            // Arrange
            var service = new NetbirdService();

            // Act & Assert
            service.Dispose(); // Should not throw
        }
    }

    public class RemoteDesktopCoordinatorTests
    {
        [Fact]
        public void RemoteDesktopCoordinator_Constructor_CreatesServices()
        {
            // Arrange & Act
            using var coordinator = new RemoteDesktopCoordinator();

            // Assert - coordinator should be created without throwing
            Assert.NotNull(coordinator);
        }

        [Fact]
        public void RemoteDesktopCoordinator_Dispose_DoesNotThrow()
        {
            // Arrange
            var coordinator = new RemoteDesktopCoordinator();

            // Act & Assert
            coordinator.Dispose(); // Should not throw
        }
    }

    public class ScreenCaptureServiceTests
    {
        [Fact]
        public void ScreenCaptureService_CaptureScreen_ReturnsBitmap()
        {
            // Arrange
            using var service = new ScreenCaptureService();

            // Act
            using var bitmap = service.CaptureScreen();

            // Assert - real capture must yield a non-empty bitmap of the live screen
            Assert.NotNull(bitmap);
            Assert.True(bitmap.Width > 0);
            Assert.True(bitmap.Height > 0);
        }
    }

    public class InputServiceTests
    {
        [Fact]
        public void InputService_DefaultConstructor_CreatesInstance()
        {
            // Arrange & Act
            using var service = new InputService();

            // Assert
            Assert.NotNull(service);
        }

        [Fact]
        public void InputService_Dispose_DoesNotThrow()
        {
            // Arrange
            var service = new InputService();

            // Act & Assert
            service.Dispose(); // Should not throw
        }

        [Fact]
        public void InputService_MapKeyboardCode_MapsKnownKeys()
        {
            // Act - invoke the private static pure mapping function
            var method = typeof(InputService).GetMethod("MapKeyboardCodeToVk",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            Assert.NotNull(method);

            ushort Enter = (ushort)method.Invoke(null, new object[] { "Enter" });
            ushort Space = (ushort)method.Invoke(null, new object[] { "Space" });
            ushort KeyA = (ushort)method.Invoke(null, new object[] { "KeyA" });
            ushort Digit1 = (ushort)method.Invoke(null, new object[] { "Digit1" });
            ushort Digit0 = (ushort)method.Invoke(null, new object[] { "Digit0" });

            // Assert - letters/digits use their ASCII VK; named keys map to VK constants
            Assert.Equal(0x0D, Enter);
            Assert.Equal(0x20, Space);
            Assert.Equal(0x41, KeyA);
            Assert.Equal(0x31, Digit1);
            Assert.Equal(0x30, Digit0);
        }
    }
}