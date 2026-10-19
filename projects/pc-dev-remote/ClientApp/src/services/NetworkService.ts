// d:\Privatework\PCremote\ClientApp\src\services\NetworkService.ts - WebSocket-based networking for Web Client

export interface FrameData {
  data: string; // base64 encoded JPEG (JSON 'frame' messages)
  blob?: Blob;  // binary JPEG payload (binary WebSocket frames)
  timestamp: number;
}

export interface HostTarget {
  host: string;
  port: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'pairing';

export type AuthStatus = 'unpaired' | 'paired' | 'expired';

// Input event kinds understood by the host. Touch is translated into the mouse
// variants; 'click' is kept for legacy compatibility.
export type InputEventType =
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'click'
  | 'keydown'
  | 'keyup'
  | 'touchstart'
  | 'touchmove'
  | 'touchend';

export class NetworkService extends EventTarget {
  private ws: WebSocket | null = null;
  private hostUrl: string = '';
  private reconnectHost = '';
  private reconnectPort = 4173;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  public status: ConnectionStatus = 'disconnected';
  public authStatus: AuthStatus = 'unpaired';

  constructor() {
    super();
    this.loadStoredAuth();
  }

  // Derive the host endpoint from where this page was served.
  // When HostApp serves the web client itself, the WebSocket lives on the
  // same origin, so every device works without any configuration.
  public static getPageTarget(): HostTarget {
    const host = window.location.hostname || 'localhost';
    const port = window.location.port ? Number(window.location.port) : 4173;
    return { host, port };
  }

  private loadStoredAuth(): void {
    try {
      const token = localStorage.getItem('pcremote_token');
      const expiry = localStorage.getItem('pcremote_tokenExpiry');
      const deviceId = localStorage.getItem('pcremote_deviceId');
      
      if (token && expiry && deviceId) {
        const expiryTime = new Date(expiry).getTime();
        if (Date.now() < expiryTime) {
          this.authStatus = 'paired';
        } else {
          this.clearStoredAuth();
          this.authStatus = 'expired';
        }
      } else {
        this.authStatus = 'unpaired';
      }
    } catch {
      this.authStatus = 'unpaired';
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('pcremote_token');
    localStorage.removeItem('pcremote_deviceId');
    localStorage.removeItem('pcremote_tokenExpiry');
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('pcremote_token');
    } catch {
      return null;
    }
  }

  // Connect to HostApp via WebSocket
  public async initializeConnection(hostIp: string, port: number = 4173): Promise<boolean> {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    let wsUrl = `${protocol}//${hostIp}:${port}/ws`;
    if (protocol === 'wss:' && this.authStatus === 'paired') {
      const token = this.getStoredToken();
      if (token) {
        wsUrl += `?token=${encodeURIComponent(token)}`;
      }
    }
    
    this.hostUrl = wsUrl;
    this.reconnectHost = hostIp;
    this.reconnectPort = port;
    this.maxReconnectAttempts = 5;
    this.status = 'connecting';
    this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
    this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));

    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(this.hostUrl);
        // Deliver binary image frames as ArrayBuffers (not Blobs) for predictable handling
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[Network] WebSocket connected to', this.hostUrl);
          this.status = 'connected';
          this.reconnectAttempts = 0;
          this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (e) {
            // Binary frame data
            this.handleBinaryFrame(event.data);
          }
        };

        this.ws.onclose = (event) => {
          console.log('[Network] WebSocket closed', event.code, event.reason);
          this.status = 'disconnected';
          this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
          
          // If closed due to auth failure, clear auth and update status
          if (event.code === 4001 || event.code === 4003) {
            this.clearStoredAuth();
            this.authStatus = 'unpaired';
            this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));
          }
          
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[Network] WebSocket error:', error);
          this.status = 'error';
          this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
        };
      } catch (error) {
        console.error('[Network] Failed to create WebSocket:', error);
        this.status = 'error';
        this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
        resolve(false);
      }
    });
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'frame': {
        const dataStr = typeof message.data === 'string' ? message.data : '';
        console.log(`[Stream] WS 'frame' message received: ${dataStr.length} chars, host timestamp ${message.timestamp}`);
        this.dispatchEvent(new CustomEvent('frameReceived', { 
          detail: { data: message.data, timestamp: message.timestamp } 
        }));
        break;
      }
      case 'ack':
        this.dispatchEvent(new CustomEvent('ack', { detail: message }));
        break;
      case 'error':
        this.dispatchEvent(new CustomEvent('error', { detail: message.message }));
        break;
      case 'auth_error':
        // Authentication error from server - clear stored auth
        this.clearStoredAuth();
        this.authStatus = 'unpaired';
        this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));
        this.status = 'error';
        this.dispatchEvent(new CustomEvent('statusChange', { detail: this.status }));
        break;
      case 'auth_required':
        this.authStatus = 'unpaired';
        this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));
        this.clearStoredAuth();
        break;
      default:
        console.warn('[Stream] Unknown WS message type:', message.type);
        break;
    }
  }

  private handleBinaryFrame(data: ArrayBuffer) {
    // Keep the raw binary frame as a Blob - the renderer creates an object URL
    // from it (WebP in motion+idle modes; the browser sniffs and decodes it).
    const blob = new Blob([data], { type: 'image/webp' });
    console.log(`[Stream] Binary WS frame received: ${blob.size} bytes -> Blob handed to renderer`);
    this.dispatchEvent(new CustomEvent('frameReceived', { 
      detail: { data: '', blob, timestamp: Date.now() } 
    }));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[Network] Reconnecting... attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.initializeConnection(this.reconnectHost, this.reconnectPort), this.reconnectDelay);
    }
  }

  // Send input event to host.
  // Touch is translated to mouse semantics (mousedown/mousemove/mouseup) so the
  // host's existing input pipeline needs no changes - the payload carries the
  // frame-space coordinates produced by the letterbox-aware canvas mapping.
  public sendInputEvent(type: InputEventType, data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = {
        type: 'input',
        inputType: type,
        data,
        timestamp: Date.now()
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  public disconnect() {
    this.maxReconnectAttempts = 0;
    this.ws?.close();
    this.ws = null;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getAuthStatus(): AuthStatus {
    return this.authStatus;
  }

  public getStoredTokenForApi(): string | null {
    return this.getStoredToken();
  }

  public setAuthToken(token: string, deviceId: string, expiresAt: string): void {
    localStorage.setItem('pcremote_token', token);
    localStorage.setItem('pcremote_deviceId', deviceId);
    localStorage.setItem('pcremote_tokenExpiry', expiresAt);
    this.authStatus = 'paired';
    this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));
  }

  public clearAuth(): void {
    this.clearStoredAuth();
    this.authStatus = 'unpaired';
    this.dispatchEvent(new CustomEvent('authStatusChange', { detail: this.authStatus }));
  }
}

// Singleton instance
export const networkService = new NetworkService();