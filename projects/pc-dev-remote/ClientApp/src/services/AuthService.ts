// d:\Privatework\PCremote\ClientApp\src\services\AuthService.ts - Client-side authentication with device pairing

export interface PairResult {
  success: boolean;
  error?: string;
  token?: string;
  deviceId?: string;
  expiresAt?: string;
}

export interface TokenData {
  token: string;
  deviceId: string;
  expiresAt: number; // Unix timestamp in ms
}

const TOKEN_STORAGE_KEY = 'pcremote_token';
const DEVICE_ID_STORAGE_KEY = 'pcremote_deviceId';
const TOKEN_EXPIRY_STORAGE_KEY = 'pcremote_tokenExpiry';

export class AuthService {
  private tokenData: TokenData | null = null;
  private refreshTimer: number | null = null;
  private listeners: Set<(token: string | null) => void> = new Set();

  constructor() {
    this.loadTokenFromStorage();
    if (this.tokenData) {
      this.scheduleTokenRefresh();
    }
  }

  private loadTokenFromStorage(): void {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
      const expiresAtStr = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);

      if (token && deviceId && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (expiresAt > Date.now()) {
          this.tokenData = { token, deviceId, expiresAt };
        } else {
          this.clearToken();
        }
      }
    } catch (e) {
      console.warn('[Auth] Failed to load token from storage:', e);
      this.clearToken();
    }
  }

  private saveTokenToStorage(tokenData: TokenData): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, tokenData.token);
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, tokenData.deviceId);
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, tokenData.expiresAt.toString());
    } catch (e) {
      console.warn('[Auth] Failed to save token to storage:', e);
    }
  }

  private clearToken(): void {
    this.tokenData = null;
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(DEVICE_ID_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    } catch (e) {
      console.warn('[Auth] Failed to clear token from storage:', e);
    }
    this.notifyListeners(null);
  }

  private notifyListeners(token: string | null): void {
    this.listeners.forEach(listener => listener(token));
  }

  public onTokenChange(listener: (token: string | null) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getToken(): string | null {
    return this.tokenData?.token ?? null;
  }

  public getDeviceId(): string | null {
    return this.tokenData?.deviceId ?? null;
  }

  public isAuthenticated(): boolean {
    return this.tokenData !== null && this.tokenData.expiresAt > Date.now();
  }

  public getTokenExpiry(): number | null {
    return this.tokenData?.expiresAt ?? null;
  }

  public async pair(code: string): Promise<PairResult> {
    try {
      const response = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data: PairResult = await response.json();

      if (data.success && data.token && data.deviceId && data.expiresAt) {
        const expiresAt = new Date(data.expiresAt).getTime();
        this.tokenData = {
          token: data.token,
          deviceId: data.deviceId,
          expiresAt
        };
        this.saveTokenToStorage(this.tokenData);
        this.scheduleTokenRefresh();
        this.notifyListeners(data.token);
        return { success: true, token: data.token, deviceId: data.deviceId, expiresAt: data.expiresAt };
      }

      return { success: false, error: data.error || 'Pairing failed' };
    } catch (err) {
      console.error('[Auth] Pairing error:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
  }

  public logout(): void {
    this.clearToken();
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private scheduleTokenRefresh(): void {
    if (this.refreshTimer) {
      window.clearTimeout(this.refreshTimer);
    }

    if (!this.tokenData) return;

    // Refresh 5 minutes before expiry
    const refreshAt = this.tokenData.expiresAt - 5 * 60 * 1000;
    const delay = refreshAt - Date.now();

    if (delay <= 0) {
      // Token already expired or expiring very soon, try to refresh now
      this.attemptTokenRefresh();
      return;
    }

    this.refreshTimer = window.setTimeout(() => {
      this.attemptTokenRefresh();
    }, delay);
  }

  private async attemptTokenRefresh(): Promise<void> {
    // For now, we don't have a refresh endpoint, so we just clear the token
    // In a future version, we could implement a refresh token flow
    console.warn('[Auth] Token expired, user needs to re-pair');
    this.logout();
    this.notifyListeners(null);
  }

  public getAuthorizationHeader(): string | null {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  }

  public getWebSocketTokenParam(): string | null {
    const token = this.getToken();
    return token ? `token=${encodeURIComponent(token)}` : null;
  }
}

export const authService = new AuthService();