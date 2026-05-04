import type { ModelScore } from "@/lib/detector";

export const ModelBreakdown = ({ models }: { models: ModelScore[] }) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {models.map((m, i) => {
        const tone =
          m.score > 65 ? "fake" : m.score > 30 ? "suspicious" : "safe";
        const barColor =
          tone === "fake"
            ? "bg-verdict-fake"
            : tone === "suspicious"
            ? "bg-verdict-suspicious"
            : "bg-verdict-safe";
        const textColor =
          tone === "fake"
            ? "text-verdict-fake"
            : tone === "suspicious"
            ? "text-verdict-suspicious"
            : "text-verdict-safe";
        return (
          <div
            key={m.id}
            className="animate-float-up rounded-xl border border-border bg-card p-5"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Model {i + 1} · {m.short}
                </div>
                <h4 className="mt-1 font-display text-base font-semibold">{m.name}</h4>
              </div>
              <div className={`font-display text-2xl font-bold tabular-nums ${textColor}`}>
                {m.score}
                <span className="text-sm">%</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full ${barColor} transition-[width] duration-700`}
                style={{ width: `${m.score}%` }}
              />
            </div>
            <ul className="mt-4 space-y-1.5">
              {m.signals.map((s) => (
                <li key={s} className="flex gap-2 text-xs text-muted-foreground">
                  <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${barColor}`} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};
