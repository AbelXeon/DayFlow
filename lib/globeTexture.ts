import * as THREE from "three";

// Wireframe / line-art style — transparent background, white strokes only, no fill.
// Cheaper than the filled version since there's less canvas work and the material
// can skip any fill compositing.
export function generateGlobeTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Transparent background — no ocean fill
  ctx.clearRect(0, 0, w, h);

  // Latitude/longitude grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 18) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 9) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Continent outlines — stroke only, no fill
  ctx.strokeStyle = "#f2f1ed";
  ctx.lineWidth = 2;

  function outline(points: [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
    }
    ctx.closePath();
    ctx.stroke();
  }

  outline([[130,120],[220,90],[260,140],[230,220],[190,260],[150,230],[110,200],[100,150]]); // N. America
  outline([[230,290],[260,300],[270,380],[240,440],[210,420],[205,340]]); // S. America
  outline([[470,200],[540,190],[560,260],[540,360],[500,400],[460,350],[450,260]]); // Africa
  outline([[470,120],[540,100],[560,150],[520,180],[480,170]]); // Europe
  outline([[580,90],[750,80],[820,140],[800,220],[700,240],[610,200],[590,150]]); // Asia
  outline([[770,340],[840,330],[860,380],[820,410],[780,390]]); // Australia

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}