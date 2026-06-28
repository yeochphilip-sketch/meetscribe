import { ImageResponse } from "next/og";

export const alt = "MeetScribe - AI Meeting Notes for Sales Teams";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #6366f1, #a855f7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "40px",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          MeetScribe
        </h1>
        <p
          style={{
            fontSize: "32px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          AI Meeting Notes for Sales Teams
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
