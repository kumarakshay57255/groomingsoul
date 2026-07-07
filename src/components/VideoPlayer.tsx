"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gauge, MonitorPlay } from "lucide-react";

type VideoPlayerProps = {
  src: string;
  posterColor?: string;
  /** Mark used in the floating anti-piracy overlay (e.g. phone · email). */
  watermark: string;
  onProgress?: (sec: number, dur: number) => void;
  onEnded?: () => void;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function VideoPlayer({
  src,
  posterColor = "#3F5F8A",
  watermark,
  onProgress,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [speed, setSpeed] = useState(1);
  const [intrinsicLabel, setIntrinsicLabel] = useState("Auto");
  const [watermarkPos, setWatermarkPos] = useState({ left: 12, top: 12 });

  /* Apply playback speed */
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed]);

  /* Detect intrinsic resolution and surface it in the quality dropdown */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onMeta = () => {
      const h = el.videoHeight;
      if (h >= 1080) setIntrinsicLabel("1080p");
      else if (h >= 720) setIntrinsicLabel("720p");
      else if (h >= 480) setIntrinsicLabel("480p");
      else if (h >= 360) setIntrinsicLabel("360p");
      else if (h > 0) setIntrinsicLabel(`${h}p`);
    };
    el.addEventListener("loadedmetadata", onMeta);
    return () => el.removeEventListener("loadedmetadata", onMeta);
  }, []);

  /* Drift the watermark every few seconds at randomised positions */
  useEffect(() => {
    const move = () => {
      // Keep within 5–80% so it stays inside the video bounds
      setWatermarkPos({
        left: 5 + Math.random() * 70,
        top: 5 + Math.random() * 75,
      });
    };
    move();
    const id = window.setInterval(move, 6500);
    return () => window.clearInterval(id);
  }, []);

  /* Lightweight progress reporting */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !onProgress) return;
    const onTime = () => onProgress(el.currentTime, el.duration || 0);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [onProgress]);

  const watermarkParts = useMemo(
    () => watermark.split("·").map((s) => s.trim()).filter(Boolean),
    [watermark]
  );

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-video overflow-hidden rounded-2xl bg-ink"
        style={{ background: posterColor }}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          controlsList="nodownload noplaybackrate"
          preload="metadata"
          playsInline
          onEnded={onEnded}
          onContextMenu={(e) => e.preventDefault()}
          className="block h-full w-full"
        />

        {/* Anti-piracy watermark — drifts every ~6.5s */}
        <div
          aria-hidden
          className="pointer-events-none absolute select-none text-[0.78rem] font-medium text-white/85 transition-all duration-700"
          style={{
            left: `${watermarkPos.left}%`,
            top: `${watermarkPos.top}%`,
            textShadow:
              "0 0 6px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.7)",
            mixBlendMode: "difference",
          }}
        >
          {watermarkParts.length === 0 ? watermark : (
            <span>
              {watermarkParts.join("  ·  ")}
            </span>
          )}
        </div>
      </div>

      {/* Custom control row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-cream px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Gauge size={15} className="text-clinical" />
          <span className="text-[0.78rem] uppercase tracking-[0.14em] text-sage-deep">
            Speed
          </span>
          <select
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="rounded-lg border border-line bg-cream px-2 py-1.5 text-sm outline-none focus:border-clinical"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <MonitorPlay size={15} className="text-clinical" />
          <span className="text-[0.78rem] uppercase tracking-[0.14em] text-sage-deep">
            Quality
          </span>
          <select
            defaultValue="auto"
            className="rounded-lg border border-line bg-cream px-2 py-1.5 text-sm outline-none focus:border-clinical"
            title="Multi-bitrate streaming arrives with the admin uploader in Phase 4"
          >
            <option value="auto">Auto · {intrinsicLabel}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
