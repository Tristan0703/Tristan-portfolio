// d:\Privatework\PCremote\HostApp\Program.cs - Application Entry Point
using System;
using System.Threading;
using System.Threading.Tasks;
using HostApp.Services;

namespace HostApp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("=========================================");
            Console.WriteLine("  Remote Desktop Application Starting...");
            Console.WriteLine("=========================================");

            using (var coordinator = new RemoteDesktopCoordinator())
            {
                Console.WriteLine("\nAttempting to start session services...");
                bool success = await coordinator.StartSessionAsync();

                if (success)
                {
                    Console.WriteLine($"\n[SUCCESS] All services initialized. Listening on mesh IP.");
                    Console.WriteLine("\nOpen the printed URL from any NetBird device to connect.");
                    await WaitUntilStoppedAsync();
                }
                else
                {
                    Console.WriteLine("\n[FAILURE] Could not start all services. Check logs above for fatal errors.");
                }
            }

            Console.WriteLine("=========================================");
            Console.WriteLine("Application Shut Down.");
        }

        private static async Task WaitUntilStoppedAsync()
        {
            var stopSignal = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
            Console.CancelKeyPress += (sender, e) =>
            {
                e.Cancel = true;
                stopSignal.TrySetResult(true);
            };

            Console.WriteLine("\nRunning... Press Ctrl+C (or any key if a console is attached) to stop.");

            // Heartbeat so the console never looks frozen/hung.
            var heartbeat = Task.Run(async () =>
            {
                while (!stopSignal.Task.IsCompleted)
                {
                    await Task.Delay(TimeSpan.FromSeconds(30));
                    Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] Server still running (Ctrl+C to stop).");
                }
            });

            try
            {
                Task done;
                if (!Console.IsInputRedirected)
                {
                    var keyTask = Task.Run(() => Console.ReadKey());
                    done = await Task.WhenAny(keyTask, stopSignal.Task);
                }
                else
                {
                    done = await Task.WhenAny(stopSignal.Task, heartbeat);
                }

                if (done == stopSignal.Task) return;
            }
            catch (InvalidOperationException)
            {
                // No console attached; keep running until the process is terminated.
                await stopSignal.Task;
            }
            finally
            {
                try { heartbeat.Dispose(); } catch { }
            }
        }
    }
}