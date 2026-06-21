export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const rad =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(rad * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

const CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
];

export function drawSkeleton(
  kp: Array<{ x: number; y: number; visibility?: number }>,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#F4793B';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (const [i, j] of CONNECTIONS) {
    const a = kp[i];
    const b = kp[j];
    if (!a || !b) continue;
    if ((a.visibility ?? 1) > 0.5 && (b.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#F4793B';
  ctx.lineWidth = 1.5;

  for (const p of kp) {
    if (!p) continue;
    if ((p.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  }
}
