import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.role} — ${profile.name}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#08090b",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
          padding: "76px",
          color: "#e9ebe8",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", width: "42px", height: "2px", backgroundColor: "#4dd8e6" }} />
          <div style={{ display: "flex", fontSize: "22px", letterSpacing: "6px", color: "#8b929a" }}>
            PORTFOLIO / 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", fontSize: "68px", lineHeight: 1.02, letterSpacing: "-2px" }}>
            {profile.role}
          </div>
          <div style={{ display: "flex", fontSize: "28px", color: "#4dd8e6" }}>
            {profile.name}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", color: "#8b929a" }}>
          <div style={{ display: "flex" }}>Full-stack infrastructure / Interactive 3D / VR</div>
          <div style={{ display: "flex", color: "#4dd8e6" }}>github.com/Tristan0703</div>
        </div>
      </div>
    ),
    size,
  );
}
