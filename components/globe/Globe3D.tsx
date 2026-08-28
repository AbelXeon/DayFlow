"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { generateGlobeTexture } from "@/lib/globeTexture";
import { globeCities, GlobeCity } from "@/lib/globeCities";

// Verified against Three.js's own SphereGeometry UV mapping — this pairing is correct
// for a standard equirectangular texture (x=(lon+180)/360*w, y=(90-lat)/180*h).
function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const ZOOM_SHOW_TIER2 = 2.6; // camera.z below this reveals tier-2 cities
const ZOOM_SHOW_LABELS = 2.3; // camera.z below this shows name labels on nearby dots

export default function Globe3D({ onSelectCity }: { onSelectCity: (city: GlobeCity) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const labelLayer = labelLayerRef.current;
    if (!mount || !labelLayer) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const geometry = new THREE.SphereGeometry(1, 48, 32);
    const texture = generateGlobeTexture();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const globe = new THREE.Mesh(geometry, material);
    group.add(globe);

    const markerGeoMajor = new THREE.SphereGeometry(0.018, 8, 8);
    const markerGeoMinor = new THREE.SphereGeometry(0.012, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf2a93b });

    const markers: { mesh: THREE.Mesh; city: GlobeCity; labelEl: HTMLDivElement }[] = [];

    globeCities.forEach((city) => {
      const mesh = new THREE.Mesh(city.tier === 1 ? markerGeoMajor : markerGeoMinor, markerMat);
      mesh.position.copy(latLonToVec3(city.lat, city.lon, 1.02));
      mesh.visible = city.tier === 1;
      mesh.userData = { city };
      group.add(mesh);

      const labelEl = document.createElement("div");
      labelEl.textContent = city.name;
      labelEl.style.cssText =
        "position:absolute;pointer-events:none;transform:translate(-50%,-140%);" +
        "font-family:var(--font-inter),sans-serif;font-size:11px;color:#f2f1ed;" +
        "background:rgba(10,12,15,0.75);padding:2px 6px;border-radius:6px;" +
        "white-space:nowrap;opacity:0;transition:opacity 0.15s;";
      labelLayer.appendChild(labelEl);

      markers.push({ mesh, city, labelEl });
    });

    function resize() {
      const w = mount!.clientWidth;
      const h = mount!.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let dragging = false;
    let lastX = 0, lastY = 0, moved = 0;
    let pinchDist: number | null = null;

    function onPointerDown(e: PointerEvent) {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      group.rotation.y += dx * 0.005;
      group.rotation.x = Math.max(-1.2, Math.min(1.2, group.rotation.x + dy * 0.005));
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onPointerUp(e: PointerEvent) {
      dragging = false;
      if (moved < 6) {
        const rect = renderer.domElement.getBoundingClientRect();
        const pointer = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.params.Mesh.threshold = 0.05;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(markers.filter((m) => m.mesh.visible).map((m) => m.mesh));
        if (hits.length > 0) {
          const city = hits[0].object.userData.city as GlobeCity;
          onSelectCity(city);
        }
      }
    }
    function onWheel(e: WheelEvent) {
      camera.position.z = Math.max(1.6, Math.min(4, camera.position.z + e.deltaY * 0.002));
    }
    function touchDist(t: TouchList) {
      const dx = t[0].clientX - t[1].clientX;
      const dy = t[0].clientY - t[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }
    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2) {
        const dist = touchDist(e.touches);
        if (pinchDist !== null) {
          const delta = pinchDist - dist;
          camera.position.z = Math.max(1.6, Math.min(4, camera.position.z + delta * 0.01));
        }
        pinchDist = dist;
      }
    }
    function onTouchEnd() {
      pinchDist = null;
    }

    const el = renderer.domElement;
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    const camDir = new THREE.Vector3();
    const worldPos = new THREE.Vector3();

    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);

      const showTier2 = camera.position.z < ZOOM_SHOW_TIER2;
      const showLabels = camera.position.z < ZOOM_SHOW_LABELS;

      camera.getWorldDirection(camDir);

      const rect = mount!.getBoundingClientRect();

      markers.forEach(({ mesh, city, labelEl }) => {
        if (city.tier === 2) mesh.visible = showTier2;
        if (!mesh.visible) {
          labelEl.style.opacity = "0";
          return;
        }

        mesh.getWorldPosition(worldPos);
        // Only label markers on the near side of the globe (facing the camera)
        const toCam = worldPos.clone().sub(camera.position).normalize();
        const facing = worldPos.clone().normalize().dot(toCam.negate()) > 0.15;

        if (showLabels && facing) {
          const projected = worldPos.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * rect.width;
          const y = (-projected.y * 0.5 + 0.5) * rect.height;
          labelEl.style.left = `${x}px`;
          labelEl.style.top = `${y}px`;
          labelEl.style.opacity = "1";
        } else {
          labelEl.style.opacity = "0";
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      markerGeoMajor.dispose();
      markerGeoMinor.dispose();
      markerMat.dispose();
      renderer.dispose();
      markers.forEach((m) => m.labelEl.remove());
      mount!.removeChild(renderer.domElement);
    };
  }, [onSelectCity]);

  return (
    <div ref={mountRef} className="relative w-full h-full touch-none">
      <div ref={labelLayerRef} className="absolute inset-0 pointer-events-none overflow-hidden" />
    </div>
  );
}