import * as THREE from "three";

// Very rough, stylized continent outlines on an equirectangular canvas.
// Not geographically accurate — deliberate clip-art style, kept simple on purpose.
export function generateGlobeTexture(): THREE.CanvasTexture {
  const w = 1024, h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // Ocean
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1c3a5e");
  grad.addColorStop(1, "#122c47");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Latitude/longitude grid — paper-globe feel
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += w / 12) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += h / 6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const land = "#6fae6a";
  const landStroke = "#4d8a4a";
  ctx.fillStyle = land;
  ctx.strokeStyle = landStroke;
  ctx.lineWidth = 2;

  function blob(points: [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const [x, y] = points[i];
      const [px, py] = points[i - 1];
      ctx.quadraticCurveTo(px, py, (px + x) / 2, (py + y) / 2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // North America
  blob([[130,120],[220,90],[260,140],[230,220],[190,260],[150,230],[110,200],[100,150]]);
  // South America
  blob([[230,290],[260,300],[270,380],[240,440],[210,420],[205,340]]);
  // Africa
  blob([[470,200],[540,190],[560,260],[540,360],[500,400],[460,350],[450,260]]);
  // Europe
  blob([[470,120],[540,100],[560,150],[520,180],[480,170]]);
  // Asia
  blob([[580,90],[750,80],[820,140],[800,220],[700,240],[610,200],[590,150]]);
  // Australia
  blob([[770,340],[840,330],[860,380],[820,410],[780,390]]);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}