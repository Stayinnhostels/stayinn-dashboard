import "./dark-backdrop.css";

/**
 * Dark mode only: a quiet starfield behind the admin shell. Light mode stays plain —
 * routes/admin.tsx renders this only while dark mode is on.
 */

// Deterministic PRNG so the stars sit in the same place on every load.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** Stars as one box-shadow list on a 1px element, spread over a 2560×1600 field. */
function stars(count: number, seed: number, alpha: [number, number]) {
  const r = rng(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.round(r() * 2560);
    const y = Math.round(r() * 1600);
    const a = (alpha[0] + r() * (alpha[1] - alpha[0])).toFixed(2);
    out.push(`${x}px ${y}px rgba(255,255,255,${a})`);
  }
  return out.join(",");
}

const SMALL = stars(620, 7, [0.45, 0.9]);
const MEDIUM = stars(160, 31, [0.65, 1]);
const LARGE = stars(40, 97, [0.85, 1]);

export function DarkBackdrop() {
  return (
    <div className="gl-dark-backdrop" aria-hidden>
      <span className="gl-star gl-star-sm" style={{ boxShadow: SMALL }} />
      <span className="gl-star gl-star-md" style={{ boxShadow: MEDIUM }} />
      <span className="gl-star gl-star-lg" style={{ boxShadow: LARGE }} />
    </div>
  );
}
