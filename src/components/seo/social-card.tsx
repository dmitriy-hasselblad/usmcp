type SocialCardProps = {
  eyebrow: string
  title: string
  description: string
  detail?: string
  accent?: "teal" | "blue" | "slate"
}

const accentColors = {
  teal: { primary: "#047c73", soft: "#dff7f1" },
  blue: { primary: "#164f7e", soft: "#e5f0fb" },
  slate: { primary: "#17314c", soft: "#edf3f7" },
}

export function SocialCard({
  accent = "blue",
  description,
  detail,
  eyebrow,
  title,
}: SocialCardProps) {
  const colors = accentColors[accent]

  return (
    <div
      style={{
        alignItems: "stretch",
        background: "linear-gradient(135deg, #f9fcff 0%, #edf8f6 54%, #eff6ff 100%)",
        color: "#0d223d",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        padding: 66,
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: colors.soft,
          borderRadius: 999,
          display: "flex",
          height: 520,
          opacity: 0.8,
          position: "absolute",
          right: -155,
          top: -230,
          width: 520,
        }}
      />
      <div
        style={{
          background: colors.primary,
          borderRadius: 999,
          bottom: -120,
          display: "flex",
          height: 340,
          opacity: 0.09,
          position: "absolute",
          right: 120,
          width: 340,
        }}
      />
      <div style={{ alignItems: "center", display: "flex", gap: 16 }}>
        <div
          style={{
            alignItems: "center",
            background: colors.primary,
            borderRadius: 18,
            color: "white",
            display: "flex",
            fontSize: 30,
            fontWeight: 700,
            height: 54,
            justifyContent: "center",
            letterSpacing: -1,
            width: 54,
          }}
        >
          SM
        </div>
        <div style={{ color: "#17314c", display: "flex", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>
          SM VIA
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", maxWidth: 920 }}>
        <div style={{ color: colors.primary, display: "flex", fontSize: 21, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: title.length > 55 ? 54 : 64, fontWeight: 700, letterSpacing: -2.8, lineHeight: 1.08, marginTop: 20 }}>
          {title}
        </div>
        <div style={{ color: "#4d6278", display: "flex", fontSize: 28, lineHeight: 1.35, marginTop: 24, maxWidth: 850 }}>
          {description}
        </div>
        {detail ? (
          <div
            style={{
              alignSelf: "flex-start",
              alignItems: "center",
              background: "rgba(255,255,255,0.82)",
              border: "1px solid #d7e4eb",
              borderRadius: 16,
              color: "#17314c",
              display: "flex",
              fontSize: 23,
              marginTop: 28,
              padding: "14px 20px",
            }}
          >
            {detail}
          </div>
        ) : null}
      </div>
      <div style={{ color: "#53677c", display: "flex", fontSize: 19, fontWeight: 600, marginTop: 42 }}>
        Your path. Our purpose. · smvia.org
      </div>
    </div>
  )
}

export function socialImageMetadata(pathname: string) {
  return [{ url: pathname, width: 1200, height: 630, alt: "SM VIA social preview" }]
}
