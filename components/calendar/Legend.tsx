/**
 * Calendar Legend (PRD FR-31, screens.md rule 4)
 * Shows emerald = Paid, amber = Owes, sits above the grid.
 * Meaning is never colour-alone — text label accompanies each swatch.
 */
export function Legend() {
  return (
    <div className="flex items-center gap-3 text-xs mb-3">
      <span className="font-medium text-slate-500">Legend:</span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0" />
        <span>Paid ✓</span>
      </span>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
        <span className="w-2 h-2 rounded-full bg-[#D97706] flex-shrink-0" />
        <span>Owes balance</span>
      </span>
    </div>
  );
}
