
export const measureAngle = (p1, p2, p3) => {
  const aa = (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y)
  const a = Math.sqrt(aa)
  const bb = (p3.x - p2.x) * (p3.x - p2.x) + (p3.y - p2.y) * (p3.y - p2.y);
  const b = Math.sqrt(bb)
  const cc = (p1.x - p3.x) * (p1.x - p3.x) + (p1.y - p3.y) * (p1.y - p3.y)
  return Math.acos((aa + bb - cc) / 2 / a / b) * 180 / Math.PI
}