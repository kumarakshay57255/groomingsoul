const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { uploadReceipt } = require('../middleware/upload');
const {
  createPurchase,
  listMyPurchases,
} = require('../controllers/purchasesController');

const router = express.Router();

router.post('/', requireAuth, uploadReceipt.single('receipt'), createPurchase);
router.get('/me', requireAuth, listMyPurchases);

module.exports = router;
