/**
 * Calendar Legend (PRD FR-31, screens.md rule 4)
 * Shows green = Paid, amber = Owes, sits above the grid.
 * Meaning is never colour-alone — text label accompanies each swatch.
 */
export function Legend() {
  return (
    <div className="flex items-center gap-6 text-sm mb-3">
      <span className="font-medium text-gray-700">Legend:</span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-4 rounded-sm bg-green-500 border border-green-600 flex-shrink-0" />
        <span className="text-gray-700">Paid ✓</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="inline-block w-4 h-4 rounded-sm bg-amber-400 border border-amber-500 flex-shrink-0" />
        <span className="text-gray-700">Owes balance</span>
      </span>
    </div>
  );
}
