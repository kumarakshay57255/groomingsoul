const express = require('express');
const { listCourses, getCourse } = require('../controllers/coursesController');

const router = express.Router();

router.get('/', listCourses);
router.get('/:slug', getCourse);

module.exports = router;
