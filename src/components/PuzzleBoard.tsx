/**
 * Interactive puzzle board — faithful React/SVG port of puzzle_progress.py.
 * Six interlocking jigsaw pieces (sign-aware nubs/indents) inside a
 * four-piece picture frame with multi-nub edges. Incomplete pieces are
 * scattered + desaturated; completing a section snaps its piece home.
 * No iframe, no DOM bridge — plain React click handlers.
 */
import { INNER_SECTIONS, FRAME_SECTIONS, type SectionKey } from "../data/sections";

interface Props {
  completed: Record<SectionKey, boolean>;
  onOpen: (key: SectionKey) => void;
}

/* ---- layout constants (identical to the original) ---- */
const W = 185, H = 90, PAD = 25, FT = 65;
const NZ = 14, NK = 5, NH = 8, HR = 11;
const COL_CTRS = [PAD + W / 2, PAD + W + W / 2, PAD + 2 * W + W / 2];
const ROW_CTRS = [PAD + H / 2, PAD + H + H / 2];

/* ---- inner piece edge config: [top, right, bottom, left]
   1 = nub out, -1 = indent, 0 = flat. Outer edges indent to receive the
   frame's nubs; interior shared edges are complementary. ---- */
const EDGES: Record<string, [number, number, number, number]> = {
  "0,0": [-1, 1, 1, -1],
  "0,1": [-1, 1, 1, -1],
  "0,2": [-1, -1, 1, -1],
  "1,0": [-1, 1, -1, -1],
  "1,1": [-1, 1, -1, -1],
  "1,2": [-1, -1, -1, -1],
};

/* ---- sign-aware jigsaw path (port of jigsawPath) ---- */
function jigsawPath(x: number, y: number, w: number, h: number,
                    top: number, right: number, bottom: number, left: number): string {
  let d = `M ${x} ${y}`;

  // TOP edge
  if (top === 0) d += ` L ${x + w} ${y}`;
  else {
    const mx = x + w / 2, nk = -top * NK, sw = top < 0 ? 1 : 0;
    d += ` L ${mx - NZ} ${y}`;
    d += ` L ${mx - NH} ${y + nk}`;
    d += ` A ${HR} ${HR} 0 1 ${sw} ${mx + NH} ${y + nk}`;
    d += ` L ${mx + NZ} ${y}`;
    d += ` L ${x + w} ${y}`;
  }

  // RIGHT edge
  if (right === 0) d += ` L ${x + w} ${y + h}`;
  else {
    const my = y + h / 2, nk = right * NK, sw = right > 0 ? 1 : 0;
    d += ` L ${x + w} ${my - NZ}`;
    d += ` L ${x + w + nk} ${my - NH}`;
    d += ` A ${HR} ${HR} 0 1 ${sw} ${x + w + nk} ${my + NH}`;
    d += ` L ${x + w} ${my + NZ}`;
    d += ` L ${x + w} ${y + h}`;
  }

  // BOTTOM edge (right to left)
  if (bottom === 0) d += ` L ${x} ${y + h}`;
  else {
    const mx = x + w / 2, nk = bottom * NK, sw = bottom > 0 ? 0 : 1;
    d += ` L ${mx + NZ} ${y + h}`;
    d += ` L ${mx + NH} ${y + h + nk}`;
    d += ` A ${HR} ${HR} 0 1 ${sw} ${mx - NH} ${y + h + nk}`;
    d += ` L ${mx - NZ} ${y + h}`;
    d += ` L ${x} ${y + h}`;
  }

  // LEFT edge (bottom to top)
  if (left === 0) d += " Z";
  else {
    const my = y + h / 2, nk = -left * NK, sw = left > 0 ? 1 : 0;
    d += ` L ${x} ${my + NZ}`;
    d += ` L ${x + nk} ${my + NH}`;
    d += ` A ${HR} ${HR} 0 1 ${sw} ${x + nk} ${my - NH}`;
    d += ` L ${x} ${my - NZ}`;
    d += " Z";
  }
  return d;
}

/* ---- frame path builders (multi-nub edges, ports of *FramePath) ---- */
function topFramePath() {
  const x = PAD - FT, y = PAD - FT, w = 3 * W + 2 * FT, h = FT;
  let d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h}`;
  for (let i = COL_CTRS.length - 1; i >= 0; i--) {
    const mx = COL_CTRS[i];
    d += ` L ${mx + NZ} ${y + h} L ${mx + NH} ${y + h + NK}`;
    d += ` A ${HR} ${HR} 0 1 0 ${mx - NH} ${y + h + NK}`;
    d += ` L ${mx - NZ} ${y + h}`;
  }
  d += ` L ${x} ${y + h} Z`;
  return { d, cx: x + w / 2, cy: y + h / 2 };
}

function bottomFramePath() {
  const x = PAD - FT, y = PAD + 2 * H, w = 3 * W + 2 * FT, h = FT;
  let d = `M ${x} ${y}`;
  for (let i = 0; i < COL_CTRS.length; i++) {
    const mx = COL_CTRS[i];
    d += ` L ${mx - NZ} ${y} L ${mx - NH} ${y - NK}`;
    d += ` A ${HR} ${HR} 0 1 0 ${mx + NH} ${y - NK}`;
    d += ` L ${mx + NZ} ${y}`;
  }
  d += ` L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  return { d, cx: x + w / 2, cy: y + h / 2 };
}

function leftFramePath() {
  const x = PAD - FT, y = PAD, w = FT, h = 2 * H;
  let d = `M ${x} ${y} L ${x + w} ${y}`;
  for (let i = 0; i < ROW_CTRS.length; i++) {
    const my = ROW_CTRS[i];
    d += ` L ${x + w} ${my - NZ} L ${x + w + NK} ${my - NH}`;
    d += ` A ${HR} ${HR} 0 1 1 ${x + w + NK} ${my + NH}`;
    d += ` L ${x + w} ${my + NZ}`;
  }
  d += ` L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  return { d, cx: x + w / 2, cy: y + h / 2 };
}

function rightFramePath() {
  const x = PAD + 3 * W, y = PAD, w = FT, h = 2 * H;
  let d = `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h}`;
  for (let i = ROW_CTRS.length - 1; i >= 0; i--) {
    const my = ROW_CTRS[i];
    d += ` L ${x} ${my + NZ} L ${x - NK} ${my + NH}`;
    d += ` A ${HR} ${HR} 0 1 1 ${x - NK} ${my - NH}`;
    d += ` L ${x} ${my - NZ}`;
  }
  d += " Z";
  return { d, cx: x + w / 2, cy: y + h / 2 };
}

const FRAME_PATHS = {
  top: topFramePath(),
  bottom: bottomFramePath(),
  left: leftFramePath(),
  right: rightFramePath(),
};

/* ---- section icons (ports of the ICONS templates) ---- */
const ICONS: Record<string, React.ReactNode> = {
  presentation: (
    <>
      <rect x={-11} y={-9} width={22} height={14} rx={1.5} fill="none" stroke="#1a1a1a" strokeWidth={1.6} />
      <line x1={-3} y1={5} x2={-5} y2={9} stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={3} y1={5} x2={5} y2={9} stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={-6} y1={9} x2={6} y2={9} stroke="#1a1a1a" strokeWidth={1.5} />
    </>
  ),
  observability: (
    <>
      <circle cx={-2} cy={-2} r={6} fill="none" stroke="#1a1a1a" strokeWidth={1.6} />
      <line x1={2.3} y1={2.3} x2={8} y2={8} stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" />
    </>
  ),
  orchestration: (
    <>
      <circle cx={0} cy={-7} r={3} fill="#1a1a1a" />
      <circle cx={-9} cy={5} r={3} fill="#1a1a1a" />
      <circle cx={9} cy={5} r={3} fill="#1a1a1a" />
      <line x1={0} y1={-4} x2={-7} y2={3} stroke="#1a1a1a" strokeWidth={1.5} />
      <line x1={0} y1={-4} x2={7} y2={3} stroke="#1a1a1a" strokeWidth={1.5} />
    </>
  ),
  intent: (
    <>
      <path d="M0,-10 L10,0 L0,10 L-10,0 Z" fill="none" stroke="#1a1a1a" strokeWidth={1.6} />
      <path d="M0,-5 L5,0 L0,5 L-5,0 Z" fill="none" stroke="#1a1a1a" strokeWidth={1.1} strokeDasharray="2,2" />
    </>
  ),
  collector: (
    <>
      <path d="M0,-10 L6,-3 L-6,-3 Z" fill="#1a1a1a" opacity={0.8} />
      <path d="M0,-4 L8,4 L-8,4 Z" fill="#1a1a1a" opacity={0.65} />
      <path d="M0,2 L9,10 L-9,10 Z" fill="#1a1a1a" opacity={0.5} />
    </>
  ),
  executor: (
    <>
      <path d="M-8,-8 L0,-2 L8,-8" fill="none" stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-8,-2 L0,4 L8,-2" fill="none" stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M-8,4 L0,10 L8,4" fill="none" stroke="#1a1a1a" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

function pieceTransform(done: boolean, s: { x: number; y: number; rot: number }, cx: number, cy: number) {
  return done ? undefined : `translate(${s.x} ${s.y}) rotate(${s.rot} ${cx} ${cy})`;
}

const labelProps = {
  textAnchor: "middle",
  fontWeight: 700,
  fill: "#ffffff",
  paintOrder: "stroke",
  stroke: "rgba(0,0,0,0.3)",
  strokeWidth: 2.5,
  style: { pointerEvents: "none" },
} satisfies React.SVGProps<SVGTextElement>;

export default function PuzzleBoard({ completed, onOpen }: Props) {
  const doneCount = Object.values(completed).filter(Boolean).length;
  const total = INNER_SECTIONS.length + FRAME_SECTIONS.length;
  const allDone = doneCount === total;

  return (
    <div className="puzzle-wrap">
      <div className="puzzle-progress">NAF Solution Progress — {doneCount} of {total} complete</div>
      <div className="pbar"><div className="pfill" style={{ width: `${(doneCount / total) * 100}%` }} /></div>
      <svg viewBox="-160 -130 960 540" style={{ overflow: "visible" }} role="group"
           aria-label="Solution wizard puzzle">
        {/* frame pieces (behind inner pieces) */}
        {FRAME_SECTIONS.map((s) => {
          const info = FRAME_PATHS[s.position];
          const done = completed[s.key];
          const vertical = s.position === "left" || s.position === "right";
          return (
            <g key={s.key}
               className={`pg ${done ? "" : "sc"}`}
               transform={pieceTransform(done, s.scatter, info.cx, info.cy)}
               onClick={() => onOpen(s.key)}
               role="button" tabIndex={0}
               onKeyDown={(e) => e.key === "Enter" && onOpen(s.key)}
               aria-label={`${s.label}${done ? " (complete)" : ""}`}>
              <path d={info.d} fill={s.color} className="pp" />
              <text {...labelProps} fontSize={vertical ? 12 : 13} letterSpacing={1.5}
                    x={info.cx} y={vertical ? info.cy : info.cy + 4}
                    dominantBaseline={vertical ? "central" : undefined}
                    transform={vertical
                      ? `rotate(${s.position === "left" ? -90 : 90} ${info.cx} ${info.cy})`
                      : undefined}>
                {s.label.toUpperCase()} {done ? "✓" : ""}
              </text>
            </g>
          );
        })}

        {/* inner pieces */}
        {INNER_SECTIONS.map((s) => {
          const x = PAD + s.col * W;
          const y = PAD + s.row * H;
          const [top, right, bottom, left] = EDGES[`${s.row},${s.col}`];
          const done = completed[s.key];
          const cx = x + W / 2;
          const cy = y + H / 2;
          return (
            <g key={s.key}
               className={`pg ${done ? "" : "sc"}`}
               transform={pieceTransform(done, s.scatter, cx, cy)}
               onClick={() => onOpen(s.key)}
               role="button" tabIndex={0}
               onKeyDown={(e) => e.key === "Enter" && onOpen(s.key)}
               aria-label={`${s.label}${done ? " (complete)" : ""}`}>
              <path d={jigsawPath(x, y, W, H, top, right, bottom, left)}
                    fill={s.color} className="pp" />
              <g transform={`translate(${cx} ${cy - 14})`}>{ICONS[s.key]}</g>
              <text {...labelProps} fontSize={14} x={cx} y={cy + 22}>
                {s.label} {done ? "✓" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      {allDone && (
        <div className="cmsg">All sections complete! Your solution design is ready. 🎉</div>
      )}
    </div>
  );
}
