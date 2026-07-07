const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getPurchaseCurriculum,
  getLesson,
  markLessonComplete,
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/courses/:purchaseId', requireAuth, getPurchaseCurriculum);
router.get('/lessons/:lessonId', requireAuth, getLesson);
router.post('/lessons/:lessonId/complete', requireAuth, markLessonComplete);

module.exports = router;
