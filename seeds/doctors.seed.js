import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/Doctor.js';

dotenv.config();

const doctors = [
  {
    name: 'Dr. Evelyn Reed',
    specialty: 'Cardiologist',
    email: 'evelyn.reed@hospital.com',
    phone: '+1234567890',
    rating: 4.9,
    reviewCount: 128,
    avatar: '👩‍⚕️',
    availableSlots: {
      morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'],
      afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']
    },
    workingDays: [1, 2, 3, 4, 5]
  },
  {
    name: 'Dr. Marcus Chen',
    specialty: 'Dermatologist',
    email: 'marcus.chen@hospital.com',
    phone: '+1234567891',
    rating: 4.8,
    reviewCount: 97,
    avatar: '👨‍⚕️',
    availableSlots: {
      morning: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM'],
      afternoon: ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM']
    },
    workingDays: [1, 2, 3, 4, 5]
  }
];

const seedDoctors = async () => {
  try {
    await mongoose.connect('mongodb+srv://mahmedzaki670_db_user:bhp12345@cluster0.k5yfs8b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB connected for seeding');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert new doctors
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded successfully');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding doctors:', err);
    process.exit(1);
  }
};

seedDoctors();