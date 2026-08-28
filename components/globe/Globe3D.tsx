"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { generateGlobeTexture } from "@/lib/globeTexture";
import { globeCities, GlobeCity } from "@/lib/globeCities";

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function Globe3D({ onSelectCity }: { onSelectCity: (city: GlobeCity) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // cap DPR — keeps it cheap on high-res phones
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Globe — unlit flat material, no lighting cost at all
    const geometry = new THREE.SphereGeometry(1, 48, 32);
    const texture = generateGlobeTexture();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const globe = new THREE.Mesh(geometry, material);
    group.add(globe);

    // City markers
    const markerGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf2a93b });
    const markers: THREE.Mesh[] = [];
    globeCities.forEach((city) => {
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(latLonToVec3(city.lat, city.lon, 1.02));
      marker.userData = { city };
      group.add(marker);
      markers.push(marker);
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

    // Pointer rotate + tap-to-select, pinch/wheel to zoom
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
        // Treat as tap — raycast against markers only
        const rect = renderer.domElement.getBoundingClientRect();
        const pointer = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.params.Mesh.threshold = 0.05;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(markers);
        if (hits.length > 0) {
          const city = hits[0].object.userData.city as GlobeCity;
          onSelectCity(city);
        }
      }
    }
    function onWheel(e: WheelEvent) {
      camera.position.z = Math.max(1.8, Math.min(4, camera.position.z + e.deltaY * 0.002));
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
          camera.position.z = Math.max(1.8, Math.min(4, camera.position.z + delta * 0.01));
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

    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
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
      markerGeo.dispose();
      markerMat.dispose();
      renderer.dispose();
      mount!.removeChild(renderer.domElement);
    };
  }, [onSelectCity]);

  return <div ref={mountRef} className="w-full h-full touch-none" />;
}