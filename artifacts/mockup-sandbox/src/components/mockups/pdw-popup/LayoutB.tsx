// Layout B — Side by Side
// Cat on the left, title + message on the right. Horizontal header.
// Streak gets its own centered row. Buttons sit side by side at the bottom.

export function LayoutB() {
  const font = "'VT323', monospace";
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1008", fontFamily: font }}>
      <div style={{
        width: 360,
        background: "#2A1F18",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}>
        {/* Header row: cat | title + message */}
        <div style={{ display: "flex", alignItems: "center", padding: "20px 20px 16px", gap: 16, position: "relative" }}>
          <button style={{
            position: "absolute", top: 12, right: 14,
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "#B5946A", width: 26, height: 26, borderRadius: 7,
            fontSize: 17, cursor: "pointer", fontFamily: font,
          }}>×</button>

          {/* Cat */}
          <div style={{
            background: "#3A2B20", borderRadius: 14,
            width: 100, height: 100, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <img
              src="/__mockup/images/cat_bounce_1.png"
              width={88} height={88}
              style={{ imageRendering: "pixelated" }}
              alt="Meowdration"
            />
          </div>

          {/* Title + message */}
          <div style={{ flex: 1, paddingRight: 20 }}>
            <p style={{ color: "#E9A883", fontSize: 30, margin: 0, fontFamily: font }}>Meowdration</p>
            <p style={{ color: "#F2D7C1", fontSize: 19, margin: "4px 0 0", fontFamily: font, lineHeight: 1.2 }}>
              Hey! Time to drink water 💧
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

        {/* Streak — centered, prominent number */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 20px 16px" }}>
          <span style={{ color: "#B5946A", fontSize: 18, fontFamily: font, letterSpacing: 1 }}>TODAY'S STREAK</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 28 }}>🏆</span>
            <span style={{ color: "#E9A883", fontSize: 56, fontFamily: font, lineHeight: 1 }}>3</span>
            <span style={{ color: "#B5946A", fontSize: 22, fontFamily: font, alignSelf: "flex-end", paddingBottom: 4 }}>drinks</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

        {/* Buttons — side by side */}
        <div style={{ display: "flex", gap: 10, padding: "16px 20px 20px" }}>
          <button style={{
            flex: 1, background: "#C47B5A", color: "#F2D7C1", border: "none",
            borderRadius: 12, padding: "14px 10px", fontSize: 22,
            fontFamily: font, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 24 }}>💧</span>
            I drank water!
          </button>
          <button style={{
            flex: 1, background: "#3A2B20", color: "#B5946A", border: "none",
            borderRadius: 12, padding: "14px 10px", fontSize: 22,
            fontFamily: font, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 24 }}>⏰</span>
            Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
