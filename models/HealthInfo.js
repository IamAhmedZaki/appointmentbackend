import mongoose from 'mongoose';

const healthInfoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conditions: [{
    name: String,
    diagnosedDate: Date,
    status: {
      type: String,
      enum: ['active', 'resolved', 'managed'],
      default: 'active'
    }
  }],
  medications: [{
    name: String,
    dosage: String,
    prescribedDate: Date,
    frequency: String
  }],
  allergies: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
      default: 'moderate'
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model('HealthInfo', healthInfoSchema);