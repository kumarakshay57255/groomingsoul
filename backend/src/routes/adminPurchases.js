const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listPurchases,
  approvePurchase,
  rejectPurchase,
} = require('../controllers/adminPurchasesController');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/purchases', listPurchases);
router.post('/purchases/:id/approve', approvePurchase);
router.post('/purchases/:id/reject', rejectPurchase);

module.exports = router;
