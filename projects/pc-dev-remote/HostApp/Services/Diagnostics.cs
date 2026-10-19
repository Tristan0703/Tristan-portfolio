// d:\Privatework\PCremote\HostApp\Services\Diagnostics.cs - Shared diagnostics helpers
//
// Set PCR_REMOTE_DEBUG=1 to enable per-frame verbose logging. Without it only
// meaningful state changes / errors / periodic summaries are printed, so the
// console stays readable during normal operation.

using System;

namespace HostApp.Services
{
    public static class Diagnostics
    {
        public static readonly bool Verbose = IsVerbose();

        public static void Debug(string message)
        {
            if (Verbose) Console.WriteLine("[Debug] " + message);
        }

        private static bool IsVerbose()
        {
            var value = Environment.GetEnvironmentVariable("PCR_REMOTE_DEBUG");
            return string.Equals(value, "1", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(value, "true", StringComparison.OrdinalIgnoreCase);
        }
    }
}