const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');

function imageUploader(subdir, maxMb = env.uploads.maxMb) {
  const dir = path.resolve(__dirname, '..', '..', env.uploads.dir, subdir);
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext)
        ? ext
        : '.jpg';
      cb(null, `${crypto.randomUUID()}${safeExt}`);
    },
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) return cb(null, true);
      cb(new Error('Only JPG, PNG, or WebP images are allowed.'));
    },
    limits: { fileSize: maxMb * 1024 * 1024 },
  });
}

const uploadReceipt = imageUploader('receipts');
const uploadTherapistPhoto = imageUploader('therapists');
const uploadTeamPhoto = imageUploader('team');
const uploadAdvisoryPhoto = imageUploader('advisory');
const uploadAchievementImage = imageUploader('achievements');
const uploadCourseCoverImage = imageUploader('courses');

/**
 * Lesson video uploader — larger size cap (~1 GB), MP4/WebM/MOV only.
 * Saved to backend/uploads/lessons/<uuid>.<ext>; lesson.videoUrl is stored as
 * `local://lessons/<filename>` which the stream proxy resolves at play time.
 */
function videoUploader() {
  const dir = path.resolve(__dirname, '..', '..', env.uploads.dir, 'lessons');
  fs.mkdirSync(dir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ['.mp4', '.webm', '.mov', '.m4v'].includes(ext)
        ? ext
        : '.mp4';
      cb(null, `${crypto.randomUUID()}${safeExt}`);
    },
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      const allowed = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-m4v',
      ];
      if (allowed.includes(file.mimetype)) return cb(null, true);
      cb(new Error('Only MP4, WebM, or MOV videos are allowed.'));
    },
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
  });
}

const uploadLessonVideo = videoUploader();

module.exports = {
  uploadReceipt,
  uploadTherapistPhoto,
  uploadTeamPhoto,
  uploadAdvisoryPhoto,
  uploadAchievementImage,
  uploadCourseCoverImage,
  uploadLessonVideo,
  imageUploader,
};
