import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "EcolnaSpace — school management platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const copy =
    locale === "ar"
      ? {
          brand: "EcolnaSpace",
          line: "إدارة هادئة لمؤسستك التعليمية",
        }
      : locale === "en"
        ? {
            brand: "EcolnaSpace",
            line: "Calm control for your school",
          }
        : {
            brand: "EcolnaSpace",
            line: "La gestion de votre établissement, au calme",
          };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#635BFF",
            }}
          />
          {copy.brand}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 650,
              lineHeight: 1.15,
              maxWidth: 900,
              letterSpacing: "-0.02em",
            }}
          >
            {copy.line}
          </div>
          <div style={{ fontSize: 22, color: "#cbd5e1", maxWidth: 720 }}>
            Students · Attendance · Grades · Payments
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#94a3b8",
          }}
        >
          <span>ecolnaspace.com</span>
          <div
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 120,
                height: 72,
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <div
              style={{
                width: 120,
                height: 72,
                borderRadius: 12,
                background: "rgba(99,91,255,0.25)",
                border: "1px solid rgba(99,91,255,0.35)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
