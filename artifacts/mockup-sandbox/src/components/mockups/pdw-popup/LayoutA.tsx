// Layout A — Cat Hero
// Large cat takes the top third; everything else flows beneath it.
// Vertical, centered, single-column. Heavy visual weight at the top.

export function LayoutA() {
  const font = "'VT323', monospace";
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1a1008", fontFamily: font }}>
      <div style={{
        width: 340,
        background: "#2A1F18",
        borderRadius: 20,
        boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* Hero cat band — full-width warm strip */}
        <div style={{
          width: "100%",
          background: "#3A2B20",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingTop: 28,
          paddingBottom: 0,
          position: "relative",
        }}>
          <button style={{
            position: "absolute", top: 10, right: 12,
            background: "rgba(255,255,255,0.06)", border: "none",
            color: "#B5946A", width: 26, height: 26, borderRadius: 7,
            fontSize: 17, cursor: "pointer", fontFamily: font,
          }}>×</button>
          <img
            src="/__mockup/images/cat_bounce_1.png"
            width={160} height={160}
            style={{ imageRendering: "pixelated", display: "block" }}
            alt="Meowdration"
          />
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px 24px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {/* Title + message */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#E9A883", fontSize: 36, margin: 0, letterSpacing: 1, fontFamily: font }}>Meowdration</p>
            <p style={{ color: "#F2D7C1", fontSize: 22, margin: "4px 0 0", fontFamily: font }}>Hey! Time to drink water 💧</p>
          </div>

          {/* Streak — inline chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#3A2B20", borderRadius: 999,
            padding: "8px 18px", alignSelf: "center",
          }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <span style={{ color: "#E9A883", fontSize: 34, fontFamily: font }}>3</span>
            <span style={{ color: "#B5946A", fontSize: 20, fontFamily: font }}>drinks today</span>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <button style={{
              background: "#C47B5A", color: "#F2D7C1", border: "none",
              borderRadius: 12, padding: "16px 20px", fontSize: 26,
              fontFamily: font, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span>💧</span> I drank water!
            </button>
            <button style={{
              background: "#3A2B20", color: "#B5946A", border: "none",
              borderRadius: 12, padding: "14px 20px", fontSize: 22,
              fontFamily: font, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <span>⏰</span> Remind me later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
