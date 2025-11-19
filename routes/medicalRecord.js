import express from 'express';
import {
  uploadMedicalRecord,
  getMedicalRecords,
  getMedicalRecordById,
  downloadMedicalRecord,
  deleteMedicalRecord,
  getHealthInfo,
  updateHealthInfo
} from '../controllers/medicalRecord.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// All routes require authentication
router.post('/upload', authMiddleware, upload.single('file'), uploadMedicalRecord);
router.get('/records', authMiddleware, getMedicalRecords);
router.get('/records/:id', authMiddleware, getMedicalRecordById);
router.get('/records/:id/download', authMiddleware, downloadMedicalRecord);
router.delete('/records/:id', authMiddleware, deleteMedicalRecord);
router.get('/health-info', authMiddleware, getHealthInfo);
router.put('/health-info', authMiddleware, updateHealthInfo);

export default router;