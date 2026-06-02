export function Popup() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#1a1008", fontFamily: "'VT323', monospace" }}
    >
      <div
        style={{
          width: 340,
          background: "#2A1F18",
          borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px 24px 24px",
          position: "relative",
          fontFamily: "'VT323', monospace",
        }}
      >
        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "rgba(255,255,255,0.07)",
            border: "none",
            color: "#B5946A",
            width: 28,
            height: 28,
            borderRadius: 8,
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
          }}
          className="text-[#ffffff]">
          ×
        </button>

        {/* Cat stage */}
        <div style={{ position: "relative", marginBottom: 4 }}>
          <img
            src="/__mockup/images/cat_bounce_1.png"
            width={128}
            height={128}
            alt="Meowdration"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        {/* Message area */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <p
            style={{
              color: "#E9A883",
              fontSize: 28,
              letterSpacing: 1,
              margin: "0 0 4px",
              fontFamily: "'VT323', monospace",
            }}
          >meowdration is back</p>
          <p
            style={{
              color: "#F2D7C1",
              fontSize: 22,
              margin: 0,
              fontFamily: "'VT323', monospace",
            }}
          >
            it's itme to sip some water
          </p>
        </div>

        {/* Streak badge */}
        <div style={{ marginBottom: 20, width: "100%" }}>
          <div
            style={{
              background: "#3A2B20",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                color: "#E9A883",
                fontSize: 32,
                fontFamily: "'VT323', monospace",
              }}
            >
              3
            </span>
            <span
              style={{
                color: "#B5946A",
                fontSize: 22,
                fontFamily: "'VT323', monospace",
              }}
            >
              sip points earned today
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          <button
            style={{
              background: "#C47B5A",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 24,
              fontFamily: "'VT323', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: 0.5,
            }}
          >
            <span>🐠</span> I drank water!
          </button>
          <button
            style={{
              background: "#3A2B20",
              color: "#ffffff",
              border: "none",
              borderRadius: 12,
              padding: "14px 20px",
              fontSize: 24,
              fontFamily: "'VT323', monospace",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: 0.5,
            }}
          >
            <span>🫧</span> Remind me later
          </button>
        </div>
      </div>
    </div>
  );
}
