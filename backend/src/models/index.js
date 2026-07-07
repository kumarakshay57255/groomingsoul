const sequelize = require('../config/db');

const User = require('./User');
const TherapyLead = require('./TherapyLead');
const TestSubmission = require('./TestSubmission');
const Course = require('./Course');
const CourseModule = require('./Module');
const Lesson = require('./Lesson');
const Purchase = require('./Purchase');
const LessonProgress = require('./LessonProgress');
const CertificateQueue = require('./CertificateQueue');
const Therapist = require('./Therapist');
const TeamMember = require('./TeamMember');
const FoundationContent = require('./FoundationContent');
const AdvisoryMember = require('./AdvisoryMember');

/* --------------------------- Associations -------------------------------- */

// Course → Modules → Lessons
Course.hasMany(CourseModule, {
  foreignKey: 'courseId',
  as: 'modules',
  onDelete: 'CASCADE',
});
CourseModule.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

CourseModule.hasMany(Lesson, {
  foreignKey: 'moduleId',
  as: 'lessons',
  onDelete: 'CASCADE',
});
Lesson.belongsTo(CourseModule, { foreignKey: 'moduleId', as: 'module' });

// User → Purchases ← Course
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Course.hasMany(Purchase, { foreignKey: 'courseId', as: 'purchases' });
Purchase.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// User → LessonProgress ← Lesson
User.hasMany(LessonProgress, { foreignKey: 'userId', as: 'progress' });
LessonProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Lesson.hasMany(LessonProgress, { foreignKey: 'lessonId', as: 'progress' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

// User → CertificateQueue ← Course
User.hasMany(CertificateQueue, { foreignKey: 'userId', as: 'certificates' });
CertificateQueue.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Course.hasMany(CertificateQueue, { foreignKey: 'courseId', as: 'certificates' });
CertificateQueue.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

module.exports = {
  sequelize,
  User,
  TherapyLead,
  TestSubmission,
  Course,
  CourseModule,
  Lesson,
  Purchase,
  LessonProgress,
  CertificateQueue,
  Therapist,
  TeamMember,
  FoundationContent,
  AdvisoryMember,
};
