import { cn } from "@/lib/utils";

export type Tile = {
  label: string;
  value: number | string;
  tone: "neutral" | "danger" | "primary" | "muted";
};

const tones: Record<Tile["tone"], string> = {
  neutral: "border-bark",
  danger: "border-rust/60",
  primary: "border-fern",
  muted: "border-moss",
};

export function SummaryTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className={cn(
            "bg-paper-dark p-4 rounded-lg ring-1 ring-black/5 border-l-2",
            tones[t.tone],
          )}
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-bark/45 mb-1">
            {t.label}
          </span>
          <span
            className={cn(
              "text-2xl font-display font-medium",
              t.tone === "danger" && "text-rust",
            )}
          >
            {t.value}
          </span>
        </div>
      ))}
    </div>
  );
}
