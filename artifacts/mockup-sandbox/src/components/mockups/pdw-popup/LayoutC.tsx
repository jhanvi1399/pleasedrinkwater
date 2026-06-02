// Layout C — Compact Panel
// Cat + title share a single left-aligned header row.
// Everything else reads top-to-bottom like a notification card.
// Dense, minimal chrome, high information-to-space ratio.

export function LayoutC() {
  const font = "'VT323', monospace";
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1008", fontFamily: font }}>
      <div style={{
        width: 340,
        background: "#2A1F18",
        borderRadius: 16,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}>
        {/* Top accent bar */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #C47B5A, #E9A883)" }} />

        <div style={{ padding: "16px 20px 20px" }}>
          {/* Header: cat + name + close on one row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <img
              src="/__mockup/images/cat_bounce_1.png"
              width={72} height={72}
              style={{ imageRendering: "pixelated", flexShrink: 0 }}
              alt="Meowdration"
            />
            <div style={{ flex: 1 }}>
              <p style={{ color: "#E9A883", fontSize: 32, margin: 0, fontFamily: font }}>Meowdration</p>
              <p style={{ color: "#F2D7C1", fontSize: 19, margin: 0, fontFamily: font }}>Time to drink water 💧</p>
            </div>
            <button style={{
              background: "rgba(255,255,255,0.06)", border: "none",
              color: "#B5946A", width: 26, height: 26, borderRadius: 7,
              fontSize: 17, cursor: "pointer", fontFamily: font,
              flexShrink: 0, alignSelf: "flex-start",
            }}>×</button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />

          {/* Streak row — horizontal, full width */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#3A2B20", borderRadius: 10, padding: "10px 14px", marginBottom: 14,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏆</span>
              <span style={{ color: "#B5946A", fontSize: 20, fontFamily: font }}>Today's streak</span>
            </div>
            <span style={{ color: "#E9A883", fontSize: 40, fontFamily: font, lineHeight: 1 }}>3</span>
          </div>

          {/* Buttons — stacked, second one borderless */}
          <button style={{
            width: "100%", background: "#C47B5A", color: "#F2D7C1", border: "none",
            borderRadius: 10, padding: "14px", fontSize: 24,
            fontFamily: font, cursor: "pointer", marginBottom: 8,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            💧 I drank water!
          </button>
          <button style={{
            width: "100%", background: "transparent", color: "#B5946A",
            border: "1px solid rgba(180,120,70,0.25)",
            borderRadius: 10, padding: "12px", fontSize: 22,
            fontFamily: font, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            ⏰ Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
