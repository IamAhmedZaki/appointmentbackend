import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getAvailableSlots,
  createAppointment,
  getUserAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  getUpcomingAppointment
} from '../controllers/appointment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

// Protected routes
router.get('/available-slots', getAvailableSlots);
router.post('/appointments', authMiddleware, createAppointment);
router.get('/appointments', authMiddleware, getUserAppointments);
router.get('/appointments/upcoming', authMiddleware, getUpcomingAppointment);
router.get('/appointments/:id', authMiddleware, getAppointmentById);
router.put('/appointments/:id', authMiddleware, updateAppointment);
router.delete('/appointments/:id', authMiddleware, cancelAppointment);

export default router;
