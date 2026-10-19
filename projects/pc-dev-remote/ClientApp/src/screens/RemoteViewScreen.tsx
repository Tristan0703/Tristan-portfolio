// d:\Privatework\PCremote\ClientApp\src\screens\RemoteViewScreen.tsx - Web React Remote Desktop Viewer
//
// Rendering pipeline (continuous binary image frame stream, NOT WebRTC):
//   binary WS frame -> Blob -> URL.createObjectURL() -> Image.onload -> ctx.drawImage()
//   -> URL.revokeObjectURL() (immediately, to prevent memory leaks on mobile).

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NetworkService, networkService, ConnectionStatus, FrameData, HostTarget } from '../services/NetworkService';
import './RemoteViewScreen.css';

interface RemoteViewScreenProps {}

const TARGET_STORAGE_KEY = 'pcremote.target';

interface PendingFrame {
  data: string;      // base64 / data-URL JPEG (JSON 'frame' messages)
  blob: Blob | null; // binary JPEG (binary WebSocket frames)
  timestamp: number;
}

function loadSavedTarget(): HostTarget | null {
  try {
    const raw = localStorage.getItem(TARGET_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HostTarget;
      if (parsed && parsed.host && parsed.port) return parsed;
    }
  } catch (err) {
    console.warn('[RemoteView] Could not read saved host target:', err);
  }
  return null;
}

export const RemoteViewScreen: React.FC<RemoteViewScreenProps> = () => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [fps, setFps] = useState(0);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPairing, setShowPairing] = useState(false);
  const [pairingLoading, setPairingLoading] = useState(false);
  // Virtual (mobile software) keyboard visibility.
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  // Viewport mode for mobile: 'auto' (letterbox), 'fit-width' (fill width, scroll vertically)
  const [viewportMode, setViewportMode] = useState<'auto' | 'fit-width'>('auto');

  // Resolve the connection target: saved override, otherwise the host that
  // served this page (auto-discovery, works on any device).
  const initialTarget = loadSavedTarget() ?? NetworkService.getPageTarget();
  const [target, setTarget] = useState<HostTarget>(initialTarget);
  const [hostInput, setHostInput] = useState<string>(initialTarget.host);
  const [portInput, setPortInput] = useState<string>(String(initialTarget.port));
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());
  const lastDrawLogRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const pendingFrameRef = useRef<PendingFrame | null>(null);
  const firstFrameLoggedRef = useRef(false);

  // Intrinsic size of the last decoded image frame - the mapping anchor for
  // touch/mouse coordinates. Empty until the first frame is drawn.
  const frameSizeRef = useRef<{ w: number; h: number } | null>(null);
  // Guards against the synthetic mouse events browsers fire after a touch.
  const lastTouchTimeRef = useRef(0);
  // --- Touch lifecycle state ---
  // Whether a mousedown was sent to the host and we are still waiting to release it.
  const touchActiveRef = useRef(false);
  // Identifier of the primary (first) touch driving input - extra fingers are ignored.
  const primaryTouchIdRef = useRef<number | null>(null);
  // Last known frame-space point of the active touch (release anchor if the lifted
  // finger is off the image or the coordinates fail to map).
  const activeTouchRef = useRef<{ x: number; y: number } | null>(null);
  // Down position + time, used to distinguish a quick tap from a drag.
  const touchDownRef = useRef<{ x: number; y: number; time: number } | null>(null);
  // Set when a second finger lands - used to detect the two-finger-tap gesture
  // that summons the virtual keyboard.
  const secondFingerAtRef = useRef(0);
// Touch indicator (cursor) for Android touch devices
  const touchIndicatorRef = useRef<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // --- Virtual keyboard (mobile software keyboard) ---
  // A hidden <input> is focused to force the phone's software keyboard up; typed
  // text arrives as input/keydown/keyup events which we forward to the host.
  const keyInputRef = useRef<HTMLInputElement>(null);
  // Remembers the last forwarded char so backspace/enter from the virtual
  // keyboard (which fire both keydown and input) are not double-sent.
  const lastVirtualCharRef = useRef<string>('');

  // --- Rendering (smooth, leak-free draw loop) ---
  // Reused decoder element instead of allocating a new Image per frame.
  const decodeImageRef = useRef<HTMLImageElement | null>(null);
  // Object URL currently owned by an in-flight decode, so a newer frame can
  // revoke the previous one (prevents mobile memory growth).
  const activeObjectUrlRef = useRef<string | null>(null);

  // Initialize connection on mount
  useEffect(() => {
    const handleStatusChange = (e: CustomEvent<ConnectionStatus>) => {
      console.log(`[Stream] Connection status -> ${e.detail}`);
      setStatus(e.detail);
      if (e.detail === 'connected') {
        setError(null);
      }
    };

    const handleAuthStatusChange = (e: CustomEvent<string>) => {
      console.log(`[Stream] Auth status -> ${e.detail}`);
      if (e.detail === 'unpaired' || e.detail === 'expired') {
        setShowPairing(true);
      } else if (e.detail === 'paired') {
        setShowPairing(false);
      }
    };

    const handleFrameReceived = (e: CustomEvent<FrameData>) => {
      const frameStart = Date.now();
      const latency = frameStart - e.detail.timestamp;
      const payloadDesc = e.detail.blob
        ? `${e.detail.blob.size} bytes (binary)`
        : `${e.detail.data.length} chars (base64)`;
      console.log(`[Stream] Frame received in browser: ${payloadDesc}, render latency ${latency}ms`);
      pendingFrameRef.current = {
        data: e.detail.data,
        blob: e.detail.blob ?? null,
        timestamp: e.detail.timestamp,
      };
      setLatency(latency);
    };

    const handleError = (e: CustomEvent<string>) => {
      setError(e.detail);
    };

    networkService.addEventListener('statusChange', handleStatusChange as EventListener);
    networkService.addEventListener('frameReceived', handleFrameReceived as EventListener);
    networkService.addEventListener('error', handleError as EventListener);
    networkService.addEventListener('authStatusChange', handleAuthStatusChange as EventListener);

    // Set initial status
    setStatus(networkService.getStatus());
    if (networkService.getAuthStatus() === 'unpaired' || networkService.getAuthStatus() === 'expired') {
      setShowPairing(true);
    }

    // Connect
    networkService.initializeConnection(target.host, target.port).catch(err => {
      setError(`Connection failed: ${err.message}`);
    });

    // Start render loop
    startRenderLoop();

    return () => {
      networkService.removeEventListener('statusChange', handleStatusChange as EventListener);
      networkService.removeEventListener('frameReceived', handleFrameReceived as EventListener);
      networkService.removeEventListener('error', handleError as EventListener);
      networkService.removeEventListener('authStatusChange', handleAuthStatusChange as EventListener);
      stopRenderLoop();
      // Free any object URL still owned by an in-flight image decode.
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
        activeObjectUrlRef.current = null;
      }
      networkService.disconnect();
    };
  }, [target.host, target.port]);

  const startRenderLoop = () => {
    const render = () => {
      drawFrame();
      animationFrameRef.current = requestAnimationFrame(render);
    };
    animationFrameRef.current = requestAnimationFrame(render);
  };

  const stopRenderLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Draws the latest pending frame onto the canvas.
  // Binary frames: Blob -> URL.createObjectURL() -> Image -> drawImage -> revokeObjectURL().
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      console.error('[Render] Canvas/2D context unavailable - frames cannot be drawn');
      return;
    }

    const pending = pendingFrameRef.current;
    if (!pending) return;
    // Take ownership of the frame; stale frames from a faster stream are dropped.
    pendingFrameRef.current = null;

    // Reuse a single decoder element; assigning a new src aborts any previous
    // decode, so any object URL still owned by the old frame must be revoked now.
    if (activeObjectUrlRef.current) {
      URL.revokeObjectURL(activeObjectUrlRef.current);
      activeObjectUrlRef.current = null;
    }

    const img = decodeImageRef.current ?? (decodeImageRef.current = new Image());

    let objectUrl: string | null = null;
    const decodeSource = pending.blob
      ? (objectUrl = URL.createObjectURL(pending.blob))
      : pending.data.startsWith('data:')
        ? pending.data
        : `data:image/jpeg;base64,${pending.data}`;
    if (objectUrl) activeObjectUrlRef.current = objectUrl;

    // Result for this specific decode; store on the element so a superseded
    // decode cleanly releases its own URL instead of the current one's.
    const releaseThisUrl = () => {
      if (objectUrl) {
        if (activeObjectUrlRef.current === objectUrl) activeObjectUrlRef.current = null;
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onload = () => {
      try {
        frameSizeRef.current = { w: img.naturalWidth, h: img.naturalHeight };
        drawImageToCanvas(ctx, canvas, img);
        updateFpsCounter();
        const now = Date.now();
        if (!firstFrameLoggedRef.current) {
          firstFrameLoggedRef.current = true;
          console.log('[Render] First frame rendered - video pipeline is working end-to-end');
        } else if (now - lastDrawLogRef.current >= 1000) {
          lastDrawLogRef.current = now;
          console.log(`[Render] Frame drawn (${img.naturalWidth}x${img.naturalHeight})`);
        }
      } catch (err) {
        console.error('[Render] drawImage threw:', err);
      } finally {
        releaseThisUrl();
      }
    };

    img.onerror = () => {
      console.error('[Render] FRAME DECODE FAILED - received data is not a valid image');
      console.error(
        '[Render] Payload ' +
        (pending.blob ? `${pending.blob.size} bytes (blob)` : `${pending.data.length} chars (base64)`)
      );
      releaseThisUrl();
    };

    img.src = decodeSource;
  }, []);

  const drawImageToCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    // Maintain aspect ratio
    const canvasAspect = canvas.width / canvas.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (viewportMode === 'fit-width') {
      // Fill width, crop top/bottom if needed - good for mobile portrait
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      offsetX = 0;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      // 'auto' - letterbox to maintain aspect ratio
      if (imgAspect > canvasAspect) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
    }

    // Clear background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // High-quality upscale - matters now the backing store is DPR-sized.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw frame
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  // Maps a CSS client-space point (mouse or touch) to the INTRINSIC coordinates
  // of the video frame (image pixels).
  //
  // CRITICAL: the canvas letterboxes to preserve the desktop aspect ratio, so the
  // point must be clamped to the ACTIVE image region (the black bars are not part
  // of the desktop). We recompute the same letterbox math used by drawImageToCanvas,
  // but in CSS px from getBoundingClientRect() so device-pixel-ratio is irrelevant.
  // The returned point is in frame-image space, which matches what the host scales
  // back to desktop pixels via its capture scale factor.
  const mapToImagePoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const size = frameSizeRef.current;
    if (!canvas || !size) return null;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    const aspect = size.w / size.h;
    const rectAspect = rect.width / rect.height;

    let regionWidth: number, regionHeight: number, regionLeft: number, regionTop: number;
    if (aspect > rectAspect) {
      regionWidth = rect.width;
      regionHeight = rect.width / aspect;
      regionLeft = 0;
      regionTop = (rect.height - regionHeight) / 2;
    } else {
      regionHeight = rect.height;
      regionWidth = rect.height * aspect;
      regionLeft = (rect.width - regionWidth) / 2;
      regionTop = 0;
    }

    const x = clientX - rect.left - regionLeft;
    const y = clientY - rect.top - regionTop;

    // Outside the active image area (letterbox bars / outside canvas): ignore,
    // those coordinates do not map to the desktop.
    if (x < 0 || y < 0 || x > regionWidth || y > regionHeight) return null;

    return {
      x: Math.round((x / regionWidth) * size.w),
      y: Math.round((y / regionHeight) * size.h),
      frameW: size.w,
      frameH: size.h,
    };
  }, []);

  const updateFpsCounter = () => {
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }
  };

  // Handle canvas resize. The backing store is sized in DEVICE pixels
  // (CSS px * devicePixelRatio, capped at 2) - without this, phones with
  // DPR 2-3 upscale a CSS-px canvas and everything looks blurry no matter
  // how good the stream is. Input mapping uses getBoundingClientRect (CSS px)
  // so it is unaffected by this change.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(container.clientWidth * dpr));
        canvas.height = Math.max(1, Math.round(container.clientHeight * dpr));
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Input handlers - forward to host as JSON payloads.
  // All coordinates go through mapToImagePoint() so they land on the DESKTOP
  // pixel grid, not the canvas grid (which includes letterboxing).
  const isSyntheticPostTouchEvent = useCallback(() => {
    // Browsers fire compatibility mouse events ~300-700ms after a touch; suppress
    // them so a single tap doesn't produce both a touch and a mouse command.
    return Date.now() - lastTouchTimeRef.current < 700;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSyntheticPostTouchEvent()) return;
    const p = mapToImagePoint(e.clientX, e.clientY);
    if (p) networkService.sendInputEvent('mousemove', p);
  }, [mapToImagePoint, isSyntheticPostTouchEvent]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSyntheticPostTouchEvent()) return;
    const p = mapToImagePoint(e.clientX, e.clientY);
    if (p) networkService.sendInputEvent('mousedown', { ...p, button: e.button });
  }, [mapToImagePoint, isSyntheticPostTouchEvent]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isSyntheticPostTouchEvent()) return;
    const p = mapToImagePoint(e.clientX, e.clientY);
    if (p) networkService.sendInputEvent('mouseup', { ...p, button: e.button });
  }, [mapToImagePoint, isSyntheticPostTouchEvent]);

  // --- Touch support (mobile) ---
  // Touch is translated into the existing host mouse semantics: finger down ->
  // mousedown, finger drag -> mousemove, finger up -> mouseup. Coordinates are
  // frame-space (the host reverse-scales them to desktop pixels).
  const getTouchPoint = useCallback((clientX: number, clientY: number) => {
    return mapToImagePoint(clientX, clientY);
  }, [mapToImagePoint]);

  // --- Virtual keyboard lifecycle ---
  // openVirtualKeyboard lives here (before the touch handlers) because the
  // two-finger-tap release path references it for the tap-to-open gesture.
  const openVirtualKeyboard = useCallback(() => {
    const input = keyInputRef.current;
    if (!input) return;
    input.focus();
    setKeyboardVisible(true);
  }, []);

  const closeVirtualKeyboard = useCallback(() => {
    keyInputRef.current?.blur();
    setKeyboardVisible(false);
  }, []);

  const toggleVirtualKeyboard = useCallback(() => {
    if (keyboardVisible) closeVirtualKeyboard();
    else openVirtualKeyboard();
  }, [keyboardVisible, openVirtualKeyboard, closeVirtualKeyboard]);

  const handlePair = useCallback(async () => {
    const codeInput = document.getElementById('pairingCodeInput') as HTMLInputElement;
    const errorDiv = document.getElementById('pairingError') as HTMLDivElement;
    const successDiv = document.getElementById('pairingSuccess') as HTMLDivElement;
    const pairBtn = document.querySelector('.btn-pair') as HTMLButtonElement;

    const code = codeInput?.value?.trim() || '';
    if (!code || code.length !== 6) {
      if (errorDiv) {
        errorDiv.textContent = 'Please enter a 6-digit code';
        errorDiv.style.display = 'block';
      }
      if (successDiv) successDiv.style.display = 'none';
      return;
    }

    setPairingLoading(true);
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
    if (pairBtn) pairBtn.disabled = true;

    try {
      const response = await fetch('/api/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (data.success) {
        if (successDiv) {
          successDiv.textContent = 'Pairing successful! Redirecting...';
          successDiv.style.display = 'block';
        }
        if (errorDiv) errorDiv.style.display = 'none';
        
        // Store token and update auth
        networkService.setAuthToken(data.token, data.deviceId, data.expiresAt);
        
        setTimeout(() => {
          setShowPairing(false);
        }, 1000);
      } else {
        if (errorDiv) {
          errorDiv.textContent = data.error || 'Pairing failed';
          errorDiv.style.display = 'block';
        }
        if (successDiv) successDiv.style.display = 'none';
      }
    } catch (err) {
      if (errorDiv) {
        errorDiv.textContent = 'Network error: ' + (err instanceof Error ? err.message : String(err));
        errorDiv.style.display = 'block';
      }
      if (successDiv) successDiv.style.display = 'none';
    } finally {
      setPairingLoading(false);
      if (pairBtn) pairBtn.disabled = false;
    }
  }, []);

  const mainRef = useRef<HTMLDivElement>(null);

  const getTouchPos = useCallback((touch: React.Touch) => {
    const main = mainRef.current;
    if (!main) return { x: touch.clientX, y: touch.clientY };
    const rect = main.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    lastTouchTimeRef.current = Date.now();
    const touch = e.touches[0];
    if (touch) {
      const pos = getTouchPos(touch);
      touchIndicatorRef.current = { x: pos.x, y: pos.y, visible: true };
    }
    if (touchActiveRef.current) {
      if (e.touches.length >= 2) secondFingerAtRef.current = Date.now();
      return;
    }
    if (!touch) return;
    const p = getTouchPoint(touch.clientX, touch.clientY);
    if (!p) return;
    touchActiveRef.current = true;
    primaryTouchIdRef.current = touch.identifier;
    activeTouchRef.current = p;
    touchDownRef.current = { x: p.x, y: p.y, time: Date.now() };
    networkService.sendInputEvent('mousedown', { ...p, button: 0 });
  }, [getTouchPoint, getTouchPos]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!touchActiveRef.current) return;
    lastTouchTimeRef.current = Date.now();
    const primary = primaryTouchIdRef.current !== null
      ? Array.from(e.touches).find(t => t.identifier === primaryTouchIdRef.current)
      : e.touches[0];
    if (primary) {
      const pos = getTouchPos(primary);
      touchIndicatorRef.current = { x: pos.x, y: pos.y, visible: true };
    }
    if (!primary) return;
    const p = getTouchPoint(primary.clientX, primary.clientY);
    if (!p) return;
    activeTouchRef.current = p;
    networkService.sendInputEvent('mousemove', p);
  }, [getTouchPoint, getTouchPos]);

  // Release logic lives at the WINDOW level (below) because touchend on the
  // canvas is missed whenever the finger lifts outside it (letterbox bar,
  // footer, off-screen edge). window events always fire, so mouseup always
  // reaches the host and the host button can never stay stuck down.
  const releaseTouch = useCallback((lifted: Touch | null) => {
    if (!touchActiveRef.current) return;
    touchActiveRef.current = false;
    const down = touchDownRef.current;
    // Prefer the lifted finger's position; fall back to the last known point.
    const p = (lifted ? getTouchPoint(lifted.clientX, lifted.clientY) : null)
      ?? activeTouchRef.current;
    // A quick press-and-release in place is a tap (click). The mousedown already
    // went out on touchstart, so an immediate mouseup completes a clean click.
    const isTap = !!down
      && Date.now() - down.time < 250
      && Math.abs((p?.x ?? down.x) - down.x) < 12
      && Math.abs((p?.y ?? down.y) - down.y) < 12;

    // A two-finger tap = our gesture to summon the on-screen keyboard: the
    // second finger landed shortly after the first and the whole gesture was a
    // quick, in-place tap (not a drag). This also releases any held click.
    const twoFingerTap = secondFingerAtRef.current !== 0
      && Date.now() - secondFingerAtRef.current < 200
      && isTap;
    secondFingerAtRef.current = 0;

    if (p) networkService.sendInputEvent('mouseup', { ...p, button: 0 });
    if (twoFingerTap) {
      console.debug('[RemoteView] two-finger tap - opening virtual keyboard');
      openVirtualKeyboard();
    } else if (isTap) {
      console.debug('[RemoteView] tap -> mouseup', p);
    } else if (p) {
      console.debug('[RemoteView] drag end -> mouseup', p);
    }
    primaryTouchIdRef.current = null;
    activeTouchRef.current = null;
    touchDownRef.current = null;
    // Hide touch indicator after a short delay so it's visible on tap
    setTimeout(() => {
      touchIndicatorRef.current = { ...touchIndicatorRef.current, visible: false };
    }, 300);
  }, [getTouchPoint, openVirtualKeyboard]);

  // Find the lifted finger by identifier, or null if it isn't in changedTouches.
  const findLiftedTouch = useCallback((e: TouchEvent) => {
    if (primaryTouchIdRef.current !== null) {
      return Array.from(e.changedTouches)
        .find(t => t.identifier === primaryTouchIdRef.current) ?? null;
    }
    return e.changedTouches[0] ?? null;
  }, []);

  const handleWindowTouchEnd = useCallback((e: TouchEvent) => {
    // Fires wherever the finger lifts - on the canvas or anywhere else.
    lastTouchTimeRef.current = Date.now();
    releaseTouch(findLiftedTouch(e));
  }, [releaseTouch, findLiftedTouch]);

  const handleWindowTouchCancel = useCallback(() => {
    // OS cancelled the gesture (e.g. interrupted by a system overlay).
    lastTouchTimeRef.current = Date.now();
    releaseTouch(null);
  }, [releaseTouch]);

  const handleWindowBlur = useCallback(() => {
    // App loses focus (backgrounded, tab switched, page hidden). Release any
    // held button so the host isn't left with a stuck-down key/button.
    if (touchActiveRef.current) releaseTouch(null);
  }, [releaseTouch]);

  // Window-level release listeners - mounted once for the app's lifetime.
  useEffect(() => {
    window.addEventListener('touchend', handleWindowTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleWindowTouchCancel, { passive: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('pagehide', handleWindowBlur);
    return () => {
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchCancel);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('pagehide', handleWindowBlur);
    };
  }, [handleWindowTouchEnd, handleWindowTouchCancel, handleWindowBlur]);

  // --- Virtual (mobile) keyboard ---
  // tap on the "Keyboard" toggle focuses a hidden <input> bound to the canvas
  // area; this forces the phone's native software keyboard to slide up. Keys
  // are serialized to the same {key, code} JSON payloads as desktop keyboards.

  // Complete single key press (down then up) for a software-keyboard tap; mobile
  // taps have no long-press semantics so a paired keyup is safe to emit now.
  const sendKeyTap = useCallback((key: string, code: string) => {
    networkService.sendInputEvent('keydown', { key, code });
    networkService.sendInputEvent('keyup', { key, code });
  }, []);

  // Best-guess DOM code for a typed character. Letters/digits get real codes;
  // other printable chars report "Unidentified" and the host falls back to the
  // key character (VkKeyScan) for injection.
  const charToKeyEvent = useCallback((ch: string): { key: string; code: string } => {
    if (ch === ' ') return { key: ' ', code: 'Space' };
    if (ch === '\n') return { key: 'Enter', code: 'Enter' };
    if (/^[A-Za-z]$/.test(ch)) return { key: ch, code: 'Key' + ch.toUpperCase() };
    if (/^[0-9]$/.test(ch)) return { key: ch, code: 'Digit' + ch };
    return { key: ch, code: 'Unidentified' };
  }, []);

  // Feature-detect beforeinput once: modern mobile browsers all support it and
  // it is the authoritative text channel; older ones fall back to value-diffing.
  const beforeinputSupportedRef = useRef<boolean | null>(null);
  useEffect(() => {
    beforeinputSupportedRef.current = 'onbeforeinput' in window || 'onbeforeinput' in HTMLInputElement.prototype;
  }, []);

  // Dedupe buffers bridging keydown -> beforeinput -> input within one stroke.
  // after a keydown forwards its key, the following beforeinput/input report the
  // SAME character and must not forward it again.
  const pendingCharRef = useRef<{ char: string; time: number } | null>(null);
  const pendingNamedRef = useRef<{ code: string; time: number } | null>(null);
  // Auto-release timer for keys whose keyup may never arrive from a soft
  // keyboard (prevents stuck keys on the host).
  const pendingKeyUpRef = useRef<{ code: string; timer: number } | null>(null);
  useEffect(() => () => {
    if (pendingKeyUpRef.current) window.clearTimeout(pendingKeyUpRef.current.timer);
  }, []);

  const handleVirtualKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const key = e.key;
    const code = e.code;
    // Soft keyboards report key='Unidentified'; the char then arrives via the
    // authoritative beforeinput channel, so let it handle the stroke. (Often
    // code is also garbage on mobile.)
    if (key === 'Unidentified') return;
    const now = Date.now();
    const payload = { key, code };

    if (key.length === 1) {
      // Printable character from a physical/paired keyboard. Forward keydown and
      // remember the char so the following beforeinput doesn't double-send.
      pendingCharRef.current = { char: key, time: now };
    } else {
      // Named/control key (Enter, Backspace, Space, arrows, ...).
      pendingNamedRef.current = { code, time: now };
    }
    networkService.sendInputEvent('keydown', payload);

    // The software keyboard often omits the matching keyup; schedule an
    // auto-release so the host never sees a stuck key. A real keyup cancels it.
    if (pendingKeyUpRef.current) window.clearTimeout(pendingKeyUpRef.current.timer);
    pendingKeyUpRef.current = {
      code,
      timer: window.setTimeout(() => {
        pendingKeyUpRef.current = null;
        networkService.sendInputEvent('keyup', payload);
        console.debug('[RemoteView] virtual key auto-released:', code);
      }, 300),
    };
  }, []);

  const handleVirtualKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.key === 'Unidentified') return;
    const payload = { key: e.key, code: e.code };
    if (pendingKeyUpRef.current && pendingKeyUpRef.current.code === payload.code) {
      window.clearTimeout(pendingKeyUpRef.current.timer);
      pendingKeyUpRef.current = null;
    }
    networkService.sendInputEvent('keyup', payload);
  }, []);

  // beforeinput is the authoritative source for the software keyboard's text.
  const handleVirtualBeforeInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const inputEvent = e.nativeEvent as InputEvent;
    const inputType = inputEvent?.inputType ?? '';
    const data = inputEvent?.data ?? '';
    const now = Date.now();

    const isFresh = (time: number) => now - time < 300;

    if (inputType === 'insertText' || inputType === 'insertCompositionText' || inputType === 'insertLineBreak') {
      if (inputType === 'insertLineBreak') {
        // Enter key: forward unless keydown already sent it.
        if (pendingNamedRef.current?.code === 'Enter' && isFresh(pendingNamedRef.current.time)) {
          pendingNamedRef.current = null;
          return;
        }
        sendKeyTap('Enter', 'Enter');
        return;
      }
      if (data) {
        for (const ch of data) {
          // Skip characters the keydown handler already forwarded.
          if (pendingCharRef.current && pendingCharRef.current.char === ch && isFresh(pendingCharRef.current.time)) {
            pendingCharRef.current = null;
            continue;
          }
          if (ch === '\n') { sendKeyTap('Enter', 'Enter'); continue; }
          const { key, code } = charToKeyEvent(ch);
          sendKeyTap(key, code);
        }
      }
    } else if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
      // Backspace key: forward unless keydown already sent it.
      if (pendingNamedRef.current?.code === 'Backspace' && isFresh(pendingNamedRef.current.time)) {
        pendingNamedRef.current = null;
        return;
      }
      sendKeyTap('Backspace', 'Backspace');
    } else if (inputType === 'insertReplacementText') {
      // Autocorrect replaced a word - drop the stale char buffer to avoid noise.
      pendingCharRef.current = null;
    }
    e.preventDefault();
  }, [sendKeyTap, charToKeyEvent]);

  // Old-browser fallback: current value minus last value = the text the software
  // keyboard typed. Only acts when beforeinput isn't available.
  const handleVirtualInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    const el = e.currentTarget;
    const raw = el.value;
    const prev = lastVirtualCharRef.current;

    if (beforeinputSupportedRef.current !== false) return;

    if (raw.length > prev.length) {
      const inserted = raw.slice(prev.length);
      for (const ch of inserted) {
        // Skip characters the keydown handler already forwarded.
        if (pendingCharRef.current && pendingCharRef.current.char === ch
            && Date.now() - pendingCharRef.current.time < 300) {
          pendingCharRef.current = null;
          continue;
        }
        if (ch === '\n') { sendKeyTap('Enter', 'Enter'); continue; }
        const { key, code } = charToKeyEvent(ch);
        sendKeyTap(key, code);
      }
    } else if (raw.length < prev.length) {
      const deletes = prev.length - raw.length;
      for (let i = 0; i < deletes; i++) sendKeyTap('Backspace', 'Backspace');
    }
    lastVirtualCharRef.current = '';
    el.value = '';
  }, [sendKeyTap, charToKeyEvent]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // The hidden virtual-keyboard input forwards keys itself; don't double-send.
    if (e.target === keyInputRef.current) return;
    networkService.sendInputEvent('keydown', { key: e.key, code: e.code });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.target === keyInputRef.current) return;
    networkService.sendInputEvent('keyup', { key: e.key, code: e.code });
  }, []);

  // Attach keyboard listeners when connected
  useEffect(() => {
    if (status === 'connected') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status, handleKeyDown, handleKeyUp]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#00ff00';
      case 'connecting': return '#ffaa00';
      case 'error': return '#ff0000';
      default: return '#888888';
    }
  };

  return (
    <div className="remote-view-container">
      <header className="remote-view-header">
        <h2>Remote Desktop Viewer</h2>
        <div className="status-indicators">
          <span className="status-dot" style={{ backgroundColor: getStatusColor() }}></span>
          <span className="status-text">{status.toUpperCase()}</span>
          {status === 'connected' && (
            <>
              <span className="metric">FPS: {fps}</span>
              <span className="metric">Latency: {latency}ms</span>
            </>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => networkService.initializeConnection(target.host, target.port)}>
            Retry
          </button>
        </div>
      )}

      {showPairing && (
        <div className="pairing-overlay">
          <div className="pairing-container">
            <h1>PCRemote Pairing</h1>
            <p className="pairing-subtitle">Enter the 6-digit code displayed on your host device</p>
            
            <div className="pairing-error" id="pairingError" style={{ display: 'none' }}></div>
            <div className="pairing-success" id="pairingSuccess" style={{ display: 'none' }}></div>
            
            <div className="pairing-form-group">
              <label htmlFor="pairingCodeInput">Pairing Code</label>
              <input
                type="text"
                id="pairingCodeInput"
                maxLength={6}
                placeholder="000000"
                autoComplete="off"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9]/g, '');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePair();
                }}
              />
            </div>
            
            <button
              className="btn-pair"
              onClick={handlePair}
              disabled={pairingLoading}
            >
              <span className="btn-pair-text">Pair Device</span>
              <span className="pairing-spinner" style={{ display: 'none' }}></span>
            </button>
            
            <p className="pairing-info">Code expires in 10 minutes. Get a new code from the host application.</p>
          </div>
        </div>
      )}

      <main ref={mainRef} className="remote-view-main">
        <canvas
          ref={canvasRef}
          className="remote-canvas"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onContextMenu={(e) => e.preventDefault()}
          tabIndex={0}
        />
        
        {/* Touch indicator / cursor for Android touch devices */}
        <div
          className="touch-indicator"
          style={{
            left: `${touchIndicatorRef.current.x}px`,
            top: `${touchIndicatorRef.current.y}px`,
            opacity: touchIndicatorRef.current.visible ? 1 : 0,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        />
        
        <div className="overlay-info">
          {status === 'disconnected' && 'Click Connect to start'}
          {status === 'connecting' && 'Connecting to host...'}
          {status === 'error' && 'Connection error - check host'}
        </div>

        {/* Hidden text input for software keyboard. Small 1px element at top-left
            of canvas container - focusable when keyboardVisible, otherwise hidden.
            Does NOT cover the canvas (no pointer-events blocking). */}
        <input
          ref={keyInputRef}
          className={`virtual-keyboard-input${keyboardVisible ? ' focused' : ''}`}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Virtual keyboard input"
          onBeforeInput={handleVirtualBeforeInput}
          onInput={handleVirtualInput}
          onKeyDown={handleVirtualKeyDown}
          onKeyUp={handleVirtualKeyUp}
          onBlur={() => setKeyboardVisible(false)}
style={keyboardVisible ? {} : { display: 'none' }}
        />
      </main>

      <footer className="remote-view-footer">
        <div className="connection-info">
          Host: {target.host}:{target.port}
        </div>
        <div className="host-settings">
          <input
            className="host-input"
            value={hostInput}
            onChange={(e) => setHostInput(e.target.value)}
            placeholder="Host"
            aria-label="Host"
          />
          <input
            className="port-input"
            value={portInput}
            onChange={(e) => setPortInput(e.target.value)}
            placeholder="Port"
            aria-label="Port"
          />
          <button
            className="btn-save"
            onClick={() => {
              const port = Number(portInput) || 4173;
              const host = hostInput.trim();
              if (!host) return;
              const next = { host, port };
              setTarget(next);
              localStorage.setItem(TARGET_STORAGE_KEY, JSON.stringify(next));
            }}
          >
            Apply
          </button>
        </div>
        <div className="controls">
          <button
            className={`btn-keyboard${keyboardVisible ? ' active' : ''}`}
            onClick={toggleVirtualKeyboard}
            title="Show/hide the on-screen keyboard"
            aria-pressed={keyboardVisible}
          >
            Keyboard {keyboardVisible ? 'hide' : 'show'}
          </button>
          <button
            className={`btn-viewport${viewportMode === 'fit-width' ? ' active' : ''}`}
            onClick={() => setViewportMode(viewportMode === 'fit-width' ? 'auto' : 'fit-width')}
            title={viewportMode === 'fit-width' ? 'Switch to letterbox mode' : 'Switch to fit-width mode (better for mobile)'}
            aria-pressed={viewportMode === 'fit-width'}
          >
            Viewport {viewportMode === 'fit-width' ? 'Fit Width' : 'Letterbox'}
          </button>
          {status === 'connected' ? (
            <button className="btn-disconnect" onClick={() => networkService.disconnect()}>
              Disconnect
            </button>
          ) : (
            <button className="btn-connect" onClick={() => networkService.initializeConnection(target.host, target.port)}>
              Connect
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default RemoteViewScreen;