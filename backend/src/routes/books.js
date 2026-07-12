const express = require('express');
const { listPublicBooks } = require('../controllers/booksController');

const router = express.Router();
router.get('/', listPublicBooks);

module.exports = router;
