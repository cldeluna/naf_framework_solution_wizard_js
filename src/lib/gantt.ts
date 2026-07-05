/**
 * Gantt chart — dependency-free SVG renderer over timeline.items (replaces
 * Plotly + kaleido). buildGanttSvg returns markup for inline display;
 * ganttPngBlob rasterizes it for the ZIP bundle.
 */
import type { WizardPayload } from "../types/wizardPayload";
import { INNER_SECTIONS } from "../data/sections";

type Items = WizardPayload["timeline"]["items"];

const COLORS = INNER_SECTIONS.map((s) => s.color);

export function buildGanttSvg(items: Items, title = "Project Timeline"): string | null {
  const rows = items.filter((i) => i.start && i.end && i.duration_bd > 0);
  if (rows.length === 0) return null;

  const t0 = Math.min(...rows.map((r) => Date.parse(r.start)));
  const t1 = Math.max(...rows.map((r) => Date.parse(r.end) + 86_400_000));
  const span = Math.max(t1 - t0, 1);

  const W = 860, LABEL = 170, PAD = 16, ROW = 34, HEAD = 46;
  const H = HEAD + rows.length * ROW + 34;
  const plotW = W - LABEL - PAD * 2;
  const x = (t: number) => LABEL + PAD + ((t - t0) / span) * plotW;

  // month gridlines
  const grid: string[] = [];
  const d = new Date(t0);
  d.setDate(1);
  while (d.getTime() < t1) {
    const gx = x(d.getTime());
    if (gx >= LABEL + PAD - 1) {
      grid.push(`<line x1="${gx.toFixed(1)}" y1="${HEAD - 8}" x2="${gx.toFixed(1)}" y2="${H - 26}" stroke="#3a4550" stroke-width="1"/>`);
      grid.push(`<text x="${gx.toFixed(1)}" y="${HEAD - 14}" font-size="10" fill="#9aa4b0" text-anchor="middle">${d.toISOString().slice(0, 7)}</text>`);
    }
    d.setMonth(d.getMonth() + 1);
  }

  const bars = rows.map((r, i) => {
    const y = HEAD + i * ROW;
    const bx = x(Date.parse(r.start));
    const bw = Math.max(x(Date.parse(r.end) + 86_400_000) - bx, 3);
    const color = COLORS[i % COLORS.length];
    const label = r.name.length > 24 ? r.name.slice(0, 23) + "…" : r.name;
    return `
    <text x="${LABEL + PAD - 8}" y="${y + 17}" font-size="12" fill="#e6e9ee" text-anchor="end">${escapeXml(label)}</text>
    <rect x="${bx.toFixed(1)}" y="${y + 4}" width="${bw.toFixed(1)}" height="${ROW - 12}" rx="5" fill="${color}" fill-opacity="0.9"/>
    <text x="${(bx + bw + 6).toFixed(1)}" y="${y + 17}" font-size="10" fill="#9aa4b0">${r.duration_bd} bd</text>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui, sans-serif">
  <rect width="${W}" height="${H}" fill="#101418"/>
  <text x="${PAD}" y="24" font-size="15" font-weight="700" fill="#e6e9ee">${escapeXml(title)}</text>
  ${grid.join("")}
  ${bars}
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Rasterize the SVG to a PNG blob (browser only). */
export async function ganttPngBlob(svg: string, scale = 2): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Gantt SVG failed to load for rasterization"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encode failed"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
