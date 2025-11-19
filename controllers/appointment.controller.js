import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-__v');
    res.json({ doctors });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ msg: 'Error fetching doctors', error: err.message });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    
    res.json({ doctor });
  } catch (err) {
    console.error('Error fetching doctor:', err);
    res.status(500).json({ msg: 'Error fetching doctor', error: err.message });
  }
};



// Get available time slots for a doctor on a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ msg: 'Doctor ID and date are required' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Check if doctor works on this day
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    if (!doctor.workingDays.includes(dayOfWeek)) {
      return res.json({ 
        availableSlots: { morning: [], afternoon: [] },
        msg: 'Doctor is not available on this day'
      });
    }

    // Get all booked appointments for this doctor on this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' }
    }).select('timeSlot');

    const bookedSlots = bookedAppointments.map(apt => apt.timeSlot);

    // Filter out booked slots
    const availableSlots = {
      morning: doctor.availableSlots.morning.filter(slot => !bookedSlots.includes(slot)),
      afternoon: doctor.availableSlots.afternoon.filter(slot => !bookedSlots.includes(slot))
    };

    res.json({ availableSlots });
  } catch (err) {
    console.error('Error fetching available slots:', err);
    res.status(500).json({ msg: 'Error fetching available slots', error: err.message });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, notes } = req.body;
    const userId = req.user.id;

    if (!doctorId || !date || !timeSlot) {
      return res.status(400).json({ msg: 'Doctor, date, and time slot are required' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Check if slot is already booked
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'cancelled' }
    });

    if (existingAppointment) {
      return res.status(400).json({ msg: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      user: userId,
      doctor: doctorId,
      date: selectedDate,
      timeSlot,
      notes: notes || ''
    });

    await appointment.save();

    // Populate doctor details
    await appointment.populate('doctor', 'name specialty rating reviewCount');

    res.status(201).json({
      msg: 'Appointment scheduled successfully',
      appointment
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ msg: 'Error creating appointment', error: err.message });
  }
};

// Get user's appointments
export const getUserAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialty rating reviewCount avatar')
      .sort({ date: 1, timeSlot: 1 });

    res.json({ appointments });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Error fetching appointments', error: err.message });
  }
};

// Get single appointment
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialty rating reviewCount avatar phone email')
      .populate('user', 'name email');

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json({ appointment });
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({ msg: 'Error fetching appointment', error: err.message });
  }
};

// Update appointment (reschedule)
export const updateAppointment = async (req, res) => {
  try {
    const { date, timeSlot, notes } = req.body;
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Check if new slot is available
    if (date && timeSlot) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId },
        doctor: appointment.doctor,
        date: { $gte: startOfDay, $lte: endOfDay },
        timeSlot,
        status: { $ne: 'cancelled' }
      });

      if (existingAppointment) {
        return res.status(400).json({ msg: 'This time slot is already booked' });
      }

      appointment.date = selectedDate;
      appointment.timeSlot = timeSlot;
      appointment.status = 'rescheduled';
    }

    if (notes !== undefined) {
      appointment.notes = notes;
    }

    await appointment.save();
    await appointment.populate('doctor', 'name specialty rating reviewCount avatar');

    res.json({
      msg: 'Appointment updated successfully',
      appointment
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ msg: 'Error updating appointment', error: err.message });
  }
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // Check if user owns this appointment
    if (appointment.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({
      msg: 'Appointment cancelled successfully',
      appointment
    });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ msg: 'Error cancelling appointment', error: err.message });
  }
};

// Get upcoming appointment (for dashboard)
export const getUpcomingAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const appointment = await Appointment.findOne({
      user: userId,
      date: { $gte: now },
      status: 'scheduled'
    })
      .populate('doctor', 'name specialty rating reviewCount avatar')
      .sort({ date: 1, timeSlot: 1 })
      .limit(1);

    res.json({ appointment });
  } catch (err) {
    console.error('Error fetching upcoming appointment:', err);
    res.status(500).json({ msg: 'Error fetching upcoming appointment', error: err.message });
  }
};
