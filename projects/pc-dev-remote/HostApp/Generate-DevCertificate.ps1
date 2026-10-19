<# 
.SYNOPSIS
    Generates a self-signed code-signing certificate and trusts it for WDAC/Device Guard testing.

.DESCRIPTION
    Creates a certificate in CurrentUser\My, adds it to Trusted Root (for testing),
    and exports the thumbprint. For production, replace with a CA-issued certificate.

.NOTES
    Run as Administrator for machine-wide trust. For user-mode testing, run normally.
#>

param(
    [string]$Subject = "CN=PCRemote Dev Certificate",
    [string]$FriendlyName = "PCRemote Development Certificate",
    [int]$ValidityYears = 1,
    [switch]$MachineWide
)

$ErrorActionPreference = "Stop"

$storeLocation = if ($MachineWide) { "LocalMachine" } else { "CurrentUser" }
$rootStoreLocation = if ($MachineWide) { "LocalMachine" } else { "CurrentUser" }

Write-Host "Generating code-signing certificate..." -ForegroundColor Cyan

$cert = New-SelfSignedCertificate `
    -Subject $Subject `
    -FriendlyName $FriendlyName `
    -CertStoreLocation "Cert:\$storeLocation\My" `
    -Type CodeSigning `
    -KeyUsage DigitalSignature `
    -KeyAlgorithm RSA `
    -KeyLength 2048 `
    -HashAlgorithm SHA256 `
    -NotAfter (Get-Date).AddYears($ValidityYears) `
    -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3") # Code Signing EKU

$thumbprint = $cert.Thumbprint
Write-Host "Generated certificate: $thumbprint" -ForegroundColor Green

# Add to Trusted Root / Trusted Publishers for testing
Write-Host "Adding certificate to Trusted Root and Trusted Publishers..." -ForegroundColor Cyan
$cert | Import-Certificate -CertStoreLocation "Cert:\$rootStoreLocation\Root" -ErrorAction SilentlyContinue
$cert | Import-Certificate -CertStoreLocation "Cert:\$rootStoreLocation\TrustedPublisher" -ErrorAction SilentlyContinue

Write-Host "`nCertificate ready for WDAC testing." -ForegroundColor Green
Write-Host "Thumbprint: $thumbprint" -ForegroundColor Yellow
Write-Host "`nBuild with:" -ForegroundColor Cyan
Write-Host "  dotnet build -p:SigningCertificateThumbprint=$thumbprint" -ForegroundColor White
Write-Host "`nTo trust machine-wide for WDAC (run as Admin):" -ForegroundColor Cyan
Write-Host "  .\Generate-DevCertificate.ps1 -MachineWide" -ForegroundColor White
Write-Host "`nNote: For production, replace with a CA-issued certificate from a trusted CA." -ForegroundColor Cyan

# Export thumbprint to file for CI
$thumbprint | Out-File -FilePath "$PSScriptRoot\dev-cert-thumbprint.txt" -Encoding ascii
Write-Host "`nThumbprint saved to: dev-cert-thumbprint.txt" -ForegroundColor Cyan