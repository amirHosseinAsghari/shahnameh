/** A hairline rule with a small lozenge at its centre. */
export function Rule({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-rule" />
      <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}
