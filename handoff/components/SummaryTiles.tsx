import { cn } from "../lib/cn";

export type Tile = {
  label: string;
  value: number | string;
  tone: "neutral" | "danger" | "primary" | "muted";
};

const toneClass: Record<Tile["tone"], string> = {
  neutral: "",
  danger:  "tile--danger",
  primary: "tile--primary",
  muted:   "tile--muted",
};

export function SummaryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="tiles">
      {tiles.map((t) => (
        <div key={t.label} className={cn("tile", toneClass[t.tone])}>
          <span className="tile__label">{t.label}</span>
          <span className="tile__value">{t.value}</span>
        </div>
      ))}
    </div>
  );
}
