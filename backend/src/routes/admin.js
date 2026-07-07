const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const {
  listPurchases,
  approvePurchase,
  rejectPurchase,
} = require('../controllers/adminPurchasesController');
const {
  listCertificates,
  markCertificate,
  triggerExpirySweep,
} = require('../controllers/adminCertController');
const { getAdminStats } = require('../controllers/adminStatsController');
const {
  listTherapists,
  createTherapist,
  updateTherapist,
  setArchiveTherapist,
} = require('../controllers/adminTherapistsController');
const {
  listTeam,
  createMember,
  updateMember,
  setArchiveMember,
  deleteMember,
  updateFoundationContent,
} = require('../controllers/teamController');
const {
  listAdvisory,
  createAdvisory,
  updateAdvisory,
  setArchiveAdvisory,
  deleteAdvisory,
} = require('../controllers/advisoryController');
const {
  uploadTherapistPhoto,
  uploadTeamPhoto,
  uploadAdvisoryPhoto,
  uploadLessonVideo,
} = require('../middleware/upload');
const {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/adminCoursesController');
const {
  listLeads,
  getLead,
  updateLead,
  deleteLead,
} = require('../controllers/adminLeadsController');
const {
  listSubmissions,
  getSubmission,
  updateSubmission,
  deleteSubmission,
} = require('../controllers/adminTestsController');
const {
  listStaff,
  inviteStaff,
  updateStaff,
  deleteStaff,
} = require('../controllers/adminStaffController');
const { asyncRoute } = require('../middleware/asyncRoute');

const router = express.Router();

/**
 * Two access tiers under /api/admin/*:
 *   - adminOnly: admins only (full read/write of foundation content + money flows)
 *   - staffOnly: admins + interns (clinical review tasks)
 *
 * Every route below picks one of these two as its gate.
 */
router.use(requireAuth);
const adminOnly = requireRole('admin');
const staffOnly = requireRole('admin', 'intern');

/* Stats / KPI dashboard — admin only */
router.get('/stats', adminOnly, getAdminStats);

/* Therapists CRUD — admin only */
router.get('/therapists', adminOnly, listTherapists);
router.post('/therapists', adminOnly, uploadTherapistPhoto.single('photo'), createTherapist);
router.patch('/therapists/:id', adminOnly, uploadTherapistPhoto.single('photo'), updateTherapist);
router.post('/therapists/:id/archive', adminOnly, setArchiveTherapist);

/* Team & founder — admin only */
router.get('/team', adminOnly, listTeam);
router.post('/team', adminOnly, uploadTeamPhoto.single('photo'), createMember);
router.patch('/team/:id', adminOnly, uploadTeamPhoto.single('photo'), updateMember);
router.post('/team/:id/archive', adminOnly, setArchiveMember);
router.delete('/team/:id', adminOnly, deleteMember);
router.patch('/foundation-content', adminOnly, updateFoundationContent);

/* Advisory panel — admin only */
router.get('/advisory', adminOnly, listAdvisory);
router.post('/advisory', adminOnly, uploadAdvisoryPhoto.single('photo'), createAdvisory);
router.patch('/advisory/:id', adminOnly, uploadAdvisoryPhoto.single('photo'), updateAdvisory);
router.post('/advisory/:id/archive', adminOnly, setArchiveAdvisory);
router.delete('/advisory/:id', adminOnly, deleteAdvisory);

/* Courses — admin only */
router.get('/courses', adminOnly, asyncRoute(listCourses));
router.get('/courses/:id', adminOnly, asyncRoute(getCourse));
router.post('/courses', adminOnly, asyncRoute(createCourse));
router.patch('/courses/:id', adminOnly, asyncRoute(updateCourse));
router.delete('/courses/:id', adminOnly, asyncRoute(deleteCourse));

/* Modules — admin only */
router.post('/courses/:id/modules', adminOnly, asyncRoute(createModule));
router.patch('/modules/:moduleId', adminOnly, asyncRoute(updateModule));
router.delete('/modules/:moduleId', adminOnly, asyncRoute(deleteModule));

/* Lessons — admin only (drag-drop video upload) */
router.post(
  '/modules/:moduleId/lessons',
  adminOnly,
  uploadLessonVideo.single('video'),
  asyncRoute(createLesson)
);
router.patch(
  '/lessons/:lessonId',
  adminOnly,
  uploadLessonVideo.single('video'),
  asyncRoute(updateLesson)
);
router.delete('/lessons/:lessonId', adminOnly, asyncRoute(deleteLesson));

/* Therapy leads (CRM) — admin + intern */
router.get('/leads', staffOnly, asyncRoute(listLeads));
router.get('/leads/:id', staffOnly, asyncRoute(getLead));
router.patch('/leads/:id', staffOnly, asyncRoute(updateLead));
router.delete('/leads/:id', adminOnly, asyncRoute(deleteLead));

/* Psychometric test submissions — admin + intern (read/update); only admin can delete */
router.get('/test-submissions', staffOnly, asyncRoute(listSubmissions));
router.get('/test-submissions/:id', staffOnly, asyncRoute(getSubmission));
router.patch('/test-submissions/:id', staffOnly, asyncRoute(updateSubmission));
router.delete('/test-submissions/:id', adminOnly, asyncRoute(deleteSubmission));

/* Staff & role management — admin only */
router.get('/staff', adminOnly, asyncRoute(listStaff));
router.post('/staff', adminOnly, asyncRoute(inviteStaff));
router.patch('/staff/:id', adminOnly, asyncRoute(updateStaff));
router.delete('/staff/:id', adminOnly, asyncRoute(deleteStaff));

/* Purchases — admin only */
router.get('/purchases', adminOnly, listPurchases);
router.post('/purchases/:id/approve', adminOnly, approvePurchase);
router.post('/purchases/:id/reject', adminOnly, rejectPurchase);

/* Certificates — admin only */
router.get('/certificates', adminOnly, listCertificates);
router.post('/certificates/:id/mark', adminOnly, markCertificate);

/* Cron control (manual trigger for testing) — admin only */
router.post('/cron/expire', adminOnly, triggerExpirySweep);

module.exports = router;
