// Decorative, non-interactive holographic background. Pure CSS animations
// (no JS) for performance and reliability.
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 700px at 50% -10%, rgba(34,211,238,0.10), transparent 60%)," +
            "radial-gradient(900px 600px at 85% 10%, rgba(168,85,247,0.12), transparent 60%)," +
            "radial-gradient(900px 700px at 10% 30%, rgba(56,189,248,0.08), transparent 60%)," +
            "linear-gradient(180deg, #04050d 0%, #05060f 40%, #04050d 100%)",
        }}
      />
      <div className="absolute inset-0 bg-grid opacity-70" />

      <div
        className="blob animate-float-slow"
        style={{
          width: 460,
          height: 460,
          top: "-6%",
          left: "8%",
          background:
            "radial-gradient(circle at 30% 30%, rgba(34,211,238,0.55), transparent 70%)",
        }}
      />
      <div
        className="blob animate-float-slow-2"
        style={{
          width: 520,
          height: 520,
          top: "20%",
          right: "2%",
          background:
            "radial-gradient(circle at 60% 40%, rgba(168,85,247,0.5), transparent 70%)",
        }}
      />
      <div
        className="blob animate-float-slow"
        style={{
          width: 380,
          height: 380,
          bottom: "-8%",
          left: "32%",
          background:
            "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.32), transparent 70%)",
        }}
      />
    </div>
  );
}
