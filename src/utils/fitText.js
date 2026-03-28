const charWidths = { 13: 7.8, 12: 7.2, 11: 6.6, 10: 6, 9: 5.4, 8: 4.8, 7: 4.2, 6: 3.6 };
const sizes = [13, 12, 11, 10, 9, 8, 7, 6];

export function fitText(text, maxW) {
  const words = text.split(" ");
  const multi = words.length > 1;

  for (const s of sizes) {
    if (text.length * charWidths[s] <= maxW) return { lines: [text], fontSize: s };
    if (multi) {
      let best = 0, bestDiff = Infinity;
      for (let i = 1; i < words.length; i++) {
        const l1 = words.slice(0, i).join(" ").length;
        const l2 = words.slice(i).join(" ").length;
        const diff = Math.abs(l1 - l2);
        if (diff < bestDiff) { bestDiff = diff; best = i; }
      }
      const line1 = words.slice(0, best).join(" ");
      const line2 = words.slice(best).join(" ");
      if (Math.max(line1.length, line2.length) * charWidths[s] <= maxW) {
        return { lines: [line1, line2], fontSize: s };
      }
    }
  }

  if (multi) {
    const mid = Math.ceil(words.length / 2);
    return { lines: [words.slice(0, mid).join(" "), words.slice(mid).join(" ")], fontSize: 6 };
  }
  return { lines: [text], fontSize: 6 };
}
