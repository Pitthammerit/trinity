export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
    .join("");
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s, l];
}

export function hslToHex(h, s, l) {
  h /= 360;
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function colorVariants(hex) {
  const [r, g, b] = hexToRgb(hex);
  return {
    fill: hex,
    bg: rgbToHex(r + (255 - r) * 0.78, g + (255 - g) * 0.78, b + (255 - b) * 0.78),
    text: rgbToHex(r * 0.45, g * 0.45, b * 0.45),
  };
}

export function generateUniqueColor(existingColors) {
  const hues = existingColors.map(c => rgbToHsl(...hexToRgb(c))[0]).sort((a, b) => a - b);
  if (hues.length === 0) return hslToHex(200, 0.38, 0.5);
  let maxGap = 0, gapStart = 0;
  for (let i = 0; i < hues.length; i++) {
    const next = i === hues.length - 1 ? hues[0] + 360 : hues[i + 1];
    const gap = next - hues[i];
    if (gap > maxGap) { maxGap = gap; gapStart = hues[i]; }
  }
  return hslToHex((gapStart + maxGap / 2) % 360, 0.35 + Math.random() * 0.1, 0.48 + Math.random() * 0.08);
}

export function glassStyle(opacity = 0.72) {
  return {
    background: `rgba(255, 255, 255, ${opacity})`,
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
  };
}
