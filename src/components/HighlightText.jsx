import { memo, Fragment } from "react";

export default memo(function HighlightText({ text, query, color }) {
  if (!query || query.length < 2) return text;
  const lc = text.toLowerCase(), q = query.toLowerCase();
  if (lc.indexOf(q) === -1) return text;
  const parts = [];
  let last = 0, idx = lc.indexOf(q, last);
  while (idx !== -1) {
    if (idx > last) parts.push({ str: text.slice(last, idx), match: false });
    parts.push({ str: text.slice(idx, idx + q.length), match: true });
    last = idx + q.length;
    idx = lc.indexOf(q, last);
  }
  if (last < text.length) parts.push({ str: text.slice(last), match: false });
  return parts.map((p, i) => p.match
    ? <span key={i} style={{ background: color + "40", borderRadius: 2, padding: "0 1px" }}>{p.str}</span>
    : <Fragment key={i}>{p.str}</Fragment>
  );
});
