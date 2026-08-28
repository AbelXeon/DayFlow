import * as THREE from "three";
import { landRings } from "./landRings";

// Wireframe globe using real coastline data (Natural Earth, public domain, 110m resolution).
// Equirectangular projection: lon -180..180 maps to x 0..w, lat 90..-90 maps to y 0..h.
export function generateGlobeTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, w, h);

  // Lat/lon grid
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 18) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 9) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  function project(lon: number, lat: number): [number, number] {
    const x = ((lon + 180) / 360) * w;
    const y = ((90 - lat) / 180) * h;
    return [x, y];
  }

  ctx.strokeStyle = "#f2f1ed";
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";

  for (const ring of landRings) {
    ctx.beginPath();
    ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}