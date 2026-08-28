import * as THREE from "three";
import { landRings } from "./landRings";
import { borderLines } from "./borderLines";

export function generateGlobeTexture(): THREE.CanvasTexture {
  const w = 2048, h = 1024; 
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.2)";
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

  // Coastlines
  ctx.strokeStyle = "#f2f1ed";
  ctx.lineWidth = 1.6;
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

  // Country borders — thinner, dimmer, drawn on top of coastlines
  ctx.strokeStyle = "rgba(242,169,59,0.55)"; // accent color, subdued
  ctx.lineWidth = 1;
  for (const line of borderLines) {
    ctx.beginPath();
    line.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}