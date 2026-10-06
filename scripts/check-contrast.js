#!/usr/bin/env node
// Checks the WCAG contrast of Marin UI's real color-token pairs in BOTH light
// and dark mode, so a pair that passes in one theme and fails in the other
// (white text on the dark-mode accent was 1.7:1) is caught before release.
// Lighthouse and other scanners only test light mode.
//
//   node scripts/check-contrast.js                      shared/app-brand.css
//   node scripts/check-contrast.js path/to/marinos.css   any file with the same tokens
//
// Reads the token values from the CSS itself (the plain :root block, then the
// :root block inside @media (prefers-color-scheme: dark)), resolves var() and
// color-mix(in srgb, ...), and exits non-zero if any pair is under its
// minimum. No dependencies. Add a pair to PAIRS when a new component puts one
// token color on another; "fg on bg" is text unless `graphic: true`.

const fs = require("fs");
const path = require("path");

const cssPath = path.resolve(process.argv[2] || path.join(__dirname, "..", "shared", "app-brand.css"));
const css = fs.readFileSync(cssPath, "utf8");

// Brace-matched body starting just after the "{" at `open`.
function bodyAt(text, open) {
  let depth = 1;
  let i = open + 1;
  while (depth && i < text.length) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") depth--;
    i++;
  }
  return { body: text.slice(open + 1, i - 1), end: i };
}

// Every `:root { ... }` body in `text`, in order (a bundle can set tokens in
// more than one :root block — the app shell adds its own after Marin UI's).
function rootBodies(text) {
  const bodies = [];
  for (const match of text.matchAll(/:root\s*\{/g)) bodies.push(bodyAt(text, match.index + match[0].length - 1).body);
  return bodies;
}

function tokens(bodies) {
  const out = {};
  for (const body of bodies) {
    for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      out[match[1]] = match[2].replace(/\/\*[\s\S]*?\*\//g, "").trim();
    }
  }
  return out;
}

// Split the file into the dark-mode @media blocks and everything else.
let lightCss = "";
const darkBodies = [];
let cursor = 0;
for (const match of css.matchAll(/@media \(prefers-color-scheme: dark\)\s*\{/g)) {
  if (match.index < cursor) continue;
  const { body, end } = bodyAt(css, match.index + match[0].length - 1);
  lightCss += css.slice(cursor, match.index);
  darkBodies.push(...rootBodies(body));
  cursor = end;
}
lightCss += css.slice(cursor);

const light = tokens(rootBodies(lightCss));
const dark = { ...light, ...tokens(darkBodies) };

// --- tiny color resolver: hex, black/white, var(), color-mix(in srgb, ...) ---
function splitTop(text) {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else current += ch;
  }
  parts.push(current.trim());
  return parts;
}

function hexToRgb(hex) {
  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function resolve(expr, theme) {
  expr = expr.trim();
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(expr)) return hexToRgb(expr);
  if (expr === "black") return [0, 0, 0];
  if (expr === "white") return [255, 255, 255];
  let m = expr.match(/^var\((--[\w-]+)\)$/);
  if (m) {
    if (!(m[1] in theme)) throw new Error(`Unknown token ${m[1]}`);
    return resolve(theme[m[1]], theme);
  }
  m = expr.match(/^color-mix\(in srgb,\s*([\s\S]+)\)$/);
  if (m) {
    const parts = splitTop(m[1]).map((part) => {
      const pm = part.match(/^([\s\S]+?)\s+(\d+(?:\.\d+)?)%$/);
      return pm ? { color: pm[1], pct: Number(pm[2]) } : { color: part, pct: null };
    });
    if (parts.length !== 2) throw new Error(`Unsupported color-mix: ${expr}`);
    let [a, b] = parts;
    if (a.pct === null && b.pct === null) a.pct = b.pct = 50;
    else if (a.pct === null) a.pct = 100 - b.pct;
    else if (b.pct === null) b.pct = 100 - a.pct;
    const ca = resolve(a.color, theme);
    const cb = resolve(b.color, theme);
    return ca.map((v, i) => Math.round((v * a.pct + cb[i] * b.pct) / (a.pct + b.pct)));
  }
  throw new Error(`Can't resolve color: ${expr}`);
}

function luminance([r, g, b]) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [name, foreground, background, minimum, options]. A foreground can be an
// object {light, dark} when dark mode uses a different rule than light mode
// (the status badges do). options.advisory reports a miss without failing.
const TEXT = 4.5;
const GRAPHIC = 3;
const TINT = (accent, pct, base) => `color-mix(in srgb, ${accent} ${pct}%, ${base})`;
const PAIRS = [
  ["body text on page", "var(--app-text)", "var(--app-bg)", TEXT],
  ["body text on soft page", "var(--app-text)", "var(--app-bg-soft)", TEXT],
  ["body text on card", "var(--app-text)", "var(--app-surface)", TEXT],
  ["muted text on page", "var(--app-muted)", "var(--app-bg)", TEXT],
  ["muted text on soft page", "var(--app-muted)", "var(--app-bg-soft)", TEXT],
  ["muted text on card", "var(--app-muted)", "var(--app-surface)", TEXT],
  ["accent link on card", "var(--app-accent)", "var(--app-surface)", TEXT],
  ["accent link on soft page", "var(--app-accent)", "var(--app-bg-soft)", TEXT],
  ["focus ring on card", "var(--app-focus)", "var(--app-surface)", GRAPHIC, true],
  ["focus ring on soft page", "var(--app-focus)", "var(--app-bg-soft)", GRAPHIC, true],
  ["accent-on-tint on 14% tint (card)", "var(--app-accent-on-tint)", TINT("var(--app-accent)", 14, "var(--app-surface)"), TEXT],
  ["accent-on-tint on 14% tint (soft page)", "var(--app-accent-on-tint)", TINT("var(--app-accent)", 14, "var(--app-bg-soft)"), TEXT],
  ["accent-on-tint on 8% tint (card)", "var(--app-accent-on-tint)", TINT("var(--app-accent)", 8, "var(--app-surface)"), TEXT],
  ["danger text on card", "var(--app-danger-text)", "var(--app-surface)", TEXT],
  ["status alpha", { light: "color-mix(in srgb, var(--app-warning) 45%, black)", dark: "var(--app-warning)" }, TINT("var(--app-warning)", 20, "var(--app-surface)"), TEXT],
  ["status beta", { light: "color-mix(in srgb, var(--app-accent) 85%, black)", dark: "var(--app-accent)" }, TINT("var(--app-accent)", 14, "var(--app-surface)"), TEXT],
  ["status live", "var(--app-success)", TINT("var(--app-success)", 18, "var(--app-surface)"), TEXT],
  ["score ring: good", "var(--app-score-good)", "var(--app-surface)", GRAPHIC, true],
  ["score ring: needs improvement", "var(--app-score-needs-improvement)", "var(--app-surface)", GRAPHIC, true],
  ["score ring: poor", "var(--app-score-poor)", "var(--app-surface)", GRAPHIC, true],
];

let failures = 0;
let advisories = 0;
for (const [themeName, theme] of [["light", light], ["dark", dark]]) {
  console.log(`\n${themeName} mode`);
  for (const [name, fgSpec, bg, min, options = {}] of PAIRS) {
    const fg = typeof fgSpec === "object" ? fgSpec[themeName] : fgSpec;
    let line;
    try {
      const value = ratio(resolve(fg, theme), resolve(bg, theme));
      const ok = value >= min;
      if (!ok && options.advisory) advisories++;
      else if (!ok) failures++;
      const label = ok ? "PASS" : options.advisory ? "WARN" : "FAIL";
      line = `${label}  ${value.toFixed(2).padStart(5)}:1 (min ${min})  ${name}`;
    } catch (error) {
      failures++;
      line = `FAIL  ${name}: ${error.message}`;
    }
    console.log(`  ${line}`);
  }
}

if (advisories) console.log(`\n${advisories} advisory pair(s) below their minimum (reported, not failing).`);
console.log(failures ? `\n${failures} pair(s) below their minimum.` : "\nAll required pairs meet their minimum in both themes.");
process.exit(failures ? 1 : 0);
