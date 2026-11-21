/**
 * Calendar empty state (PRD FR-38, screens.md rule 11)
 * Shown when no active bookings exist in the displayed month.
 */
export function EmptyState() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-500 text-sm">
      No bookings this month. Click any date to add one.
    </div>
  );
}
