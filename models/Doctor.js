import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: '👨‍⚕️'
  },
  availableSlots: {
    morning: {
      type: [String],
      default: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM']
    },
    afternoon: {
      type: [String],
      default: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']
    }
  },
  workingDays: {
    type: [Number], // 0 = Sunday, 1 = Monday, etc.
    default: [1, 2, 3, 4, 5] // Monday to Friday
  }
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);