"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileVideo, Loader2, Trash2, Upload, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import {
  AdminLesson,
  uploadLesson,
  updateLessonWithVideo,
  formatDuration,
} from "@/lib/adminCourses";

type Props = {
  moduleId: string;
  initial: AdminLesson | null;
  onClose: () => void;
  onSaved: (lesson: AdminLesson) => void;
};

export function LessonEditor({ moduleId, initial, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [durationSec, setDurationSec] = useState(initial?.durationSec ?? 0);
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function pickFile(f: File | null) {
    if (!f) {
      setVideoFile(null);
      return;
    }
    if (f.size > 1024 * 1024 * 1024) {
      setError("Video is larger than 1 GB. Compress before uploading.");
      return;
    }
    if (!/^video\/(mp4|webm|quicktime|x-m4v)$/.test(f.type)) {
      setError("Unsupported video type. Use MP4, WebM, or MOV.");
      return;
    }
    setVideoFile(f);
    setRemoveVideo(false);
    setError(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setSubmitting(true);
    setProgress(videoFile ? 0 : null);
    try {
      const lesson = initial
        ? await updateLessonWithVideo({
            lessonId: initial.id,
            title: title.trim(),
            description,
            durationSec,
            position,
            videoFile,
            removeVideo,
            onProgress: (p) => setProgress(p),
          })
        : await uploadLesson({
            moduleId,
            title: title.trim(),
            description,
            durationSec,
            position,
            videoFile,
            onProgress: (p) => setProgress(p),
          });
      onSaved(lesson);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  const showExistingVideo = initial?.hasVideo && !videoFile && !removeVideo;

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-sm"
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-line bg-cream shadow-[0_30px_80px_-30px_rgba(92,58,46,0.5)]"
      >
        <div className="flex items-start justify-between border-b border-line px-7 py-5">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
              {initial ? "Edit lesson" : "New lesson"}
            </p>
            <h2 className="mt-1 font-display text-2xl text-brand-brown">
              {initial ? initial.title : "Add a lesson"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-soft hover:bg-cream-deep"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-7 py-6">
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Introduction to CBT triangles"
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
          </div>

          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Description (optional)
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short summary shown above the player."
              className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Duration (seconds)
              </label>
              <input
                type="number"
                min={0}
                value={durationSec === 0 ? "" : durationSec}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return setDurationSec(0);
                  const n = parseInt(raw.replace(/^0+(?=\d)/, ""), 10);
                  setDurationSec(Number.isFinite(n) ? Math.max(0, n) : 0);
                }}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
              <p className="mt-1 text-[0.7rem] text-ink-soft">
                Displays as {formatDuration(durationSec)}
              </p>
            </div>
            <div>
              <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
                Position
              </label>
              <input
                type="number"
                min={0}
                value={position === 0 ? "" : position}
                placeholder="0"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === "") return setPosition(0);
                  const n = parseInt(raw.replace(/^0+(?=\d)/, ""), 10);
                  setPosition(Number.isFinite(n) ? Math.max(0, n) : 0);
                }}
                className="mt-1.5 w-full rounded-xl border border-line bg-cream px-3 py-2 text-sm outline-none focus:border-clinical"
              />
              <p className="mt-1 text-[0.7rem] text-ink-soft">
                If taken, we&apos;ll bump to the next free slot.
              </p>
            </div>
          </div>

          {/* Drag-drop video uploader */}
          <div>
            <label className="text-[0.7rem] uppercase tracking-[0.14em] text-sage-deep">
              Lesson video
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-cream-deep/40 px-6 py-8 text-center transition-colors ${
                dragging
                  ? "border-clinical bg-clinical-soft/40"
                  : "border-brand-brown/30 hover:border-clinical"
              }`}
            >
              {videoFile ? (
                <>
                  <FileVideo size={28} className="text-clinical" />
                  <div className="text-sm font-medium text-brand-brown">
                    {videoFile.name}
                  </div>
                  <div className="text-[0.78rem] text-ink-soft">
                    {(videoFile.size / 1024 / 1024).toFixed(1)} MB · ready to
                    upload
                  </div>
                </>
              ) : showExistingVideo ? (
                <>
                  <CheckCircle2 size={26} className="text-sage-deep" />
                  <div className="text-sm font-medium text-brand-brown">
                    Existing video on file
                  </div>
                  <div className="font-mono text-[0.7rem] text-ink-soft">
                    {initial?.videoUrl}
                  </div>
                  <div className="text-[0.78rem] text-ink-soft">
                    Drop a new MP4 here to replace it.
                  </div>
                </>
              ) : (
                <>
                  <Upload size={26} className="text-brand-brown" />
                  <div className="text-sm font-medium text-brand-brown">
                    Drag &amp; drop or click to upload
                  </div>
                  <div className="text-[0.78rem] text-ink-soft">
                    MP4 / WebM / MOV · up to 1 GB
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
            </div>

            {/* Action row under uploader */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.78rem]">
              {videoFile && (
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="inline-flex items-center gap-1 text-ink-soft hover:text-brand-brown"
                >
                  <Trash2 size={11} /> Cancel this upload
                </button>
              )}
              {initial?.hasVideo && !videoFile && (
                <label className="inline-flex cursor-pointer items-center gap-1.5 text-coral">
                  <input
                    type="checkbox"
                    checked={removeVideo}
                    onChange={(e) => setRemoveVideo(e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Remove existing video on save
                </label>
              )}
            </div>

            {progress !== null && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-cream-deep">
                  <div
                    className="h-full bg-clinical transition-[width] duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[0.78rem] text-ink-soft">
                  {progress < 100
                    ? `Uploading… ${progress}%`
                    : "Finalising on server…"}
                </p>
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl border border-coral/40 bg-coral-soft/40 px-3 py-2 text-sm text-brand-brown">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line bg-cream-deep/30 px-7 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:border-brand-brown/40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-clinical px-5 py-2 text-sm font-medium text-cream hover:bg-clinical-deep disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                {progress !== null && progress < 100
                  ? `Uploading ${progress}%`
                  : "Saving…"}
              </>
            ) : initial ? (
              "Save changes"
            ) : (
              "Create lesson"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
