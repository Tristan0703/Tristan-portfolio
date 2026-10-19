"use client";

import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

const ACCENT = new Color("#4dd8e6");
const MAX_PIXEL_RATIO = 1.5;

export function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      mount.classList.add("hatch");
      mount.dataset.heroCanvas = "failed";
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new Scene();
    const camera = new PerspectiveCamera(38, 1, 0.1, 60);
    camera.position.set(0, 0, 4.6);

    const group = new Group();
    scene.add(group);

    const innerGeometry = new IcosahedronGeometry(1.12, 0);
    const innerEdges = new EdgesGeometry(innerGeometry);
    const innerMaterial = new LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.55,
    });
    const inner = new LineSegments(innerEdges, innerMaterial);
    group.add(inner);

    const outerGeometry = new IcosahedronGeometry(1.9, 1);
    const outerEdges = new EdgesGeometry(outerGeometry);
    const outerMaterial = new LineBasicMaterial({
      color: ACCENT,
      transparent: true,
      opacity: 0.14,
    });
    const outer = new LineSegments(outerEdges, outerMaterial);
    group.add(outer);

    const nodeGeometry = new BufferGeometry();
    nodeGeometry.setAttribute(
      "position",
      new BufferAttribute(
        Float32Array.from(
          (innerGeometry.getAttribute("position") as BufferAttribute).array,
        ),
        3,
      ),
    );
    const nodeMaterial = new PointsMaterial({
      color: ACCENT,
      size: 0.055,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const nodes = new Points(nodeGeometry, nodeMaterial);
    group.add(nodes);

    const shellCount = 420;
    const shellPositions = new Float32Array(shellCount * 3);
    for (let i = 0; i < shellCount; i += 1) {
      const point = new Vector3()
        .randomDirection()
        .multiplyScalar(2.15 + Math.random() * 0.4);
      shellPositions.set([point.x, point.y, point.z], i * 3);
    }
    const shellGeometry = new BufferGeometry();
    shellGeometry.setAttribute("position", new BufferAttribute(shellPositions, 3));
    const shellMaterial = new PointsMaterial({
      color: ACCENT,
      size: 0.015,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const shell = new Points(shellGeometry, shellMaterial);
    group.add(shell);

    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (width === 0 || height === 0) {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    let frame = 0;
    let running = false;
    let lastTime = 0;

    const draw = () => {
      camera.position.x += (pointer.x * 0.32 - camera.position.x) * 0.045;
      camera.position.y += (-pointer.y * 0.22 - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    const tick = (time: number) => {
      if (!running) {
        return;
      }
      frame = window.requestAnimationFrame(tick);
      const delta = lastTime === 0 ? 0 : Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      group.rotation.y += delta * 0.12;
      group.rotation.x += delta * 0.03;
      inner.rotation.y -= delta * 0.22;
      inner.rotation.x += delta * 0.1;
      outer.rotation.y += delta * 0.07;
      shell.rotation.y -= delta * 0.05;

      draw();
    };

    const start = () => {
      if (running || reduceMotion) {
        return;
      }
      running = true;
      lastTime = 0;
      frame = window.requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    let visible = true;

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else if (visible) {
        start();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(mount);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduceMotion) {
        draw();
      }
    });

    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    resize();
    resizeObserver.observe(mount);
    draw();

    if (reduceMotion) {
      renderer.render(scene, camera);
    } else {
      mount.addEventListener("pointermove", onPointerMove);
      mount.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibilityChange);
      start();
    }

    mount.dataset.heroCanvas = "ready";

    return () => {
      stop();
      observer.disconnect();
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      innerGeometry.dispose();
      innerEdges.dispose();
      innerMaterial.dispose();
      outerGeometry.dispose();
      outerEdges.dispose();
      outerMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      shellGeometry.dispose();
      shellMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="h-full w-full"
      aria-hidden="true"
      data-hero-canvas="pending"
    />
  );
}
