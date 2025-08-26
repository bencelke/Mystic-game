export function Glow({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-60 ${className}`}
      style={{
        background:
          'radial-gradient(40% 40% at 50% 0%, rgba(251,191,36,0.15), transparent 60%), radial-gradient(50% 50% at 10% 50%, rgba(109,40,217,0.25), transparent 60%)',
      }}
    />
  );
}
