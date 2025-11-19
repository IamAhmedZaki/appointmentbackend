import MedicalRecord from '../models/MedicalRecord.js';
import HealthInfo from '../models/HealthInfo.js';
import fs from 'fs';
import path from 'path';

// Upload medical record
export const uploadMedicalRecord = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ msg: "Please upload a file" });
    }

    const medicalRecord = new MedicalRecord({
      user: userId,
      title: title || req.file.originalname,
      description: description || "",
      category: category || "other",

      fileName: req.file.originalname,
      filePath: req.file.path,         // Cloudinary URL
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    await medicalRecord.save();

    res.status(201).json({
      msg: "Medical record uploaded successfully",
      record: medicalRecord
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Error uploading medical record", error: err.message });
  }
};


// Get all medical records for user
export const getMedicalRecords = async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await MedicalRecord.find({ user: userId })
      .sort({ uploadDate: -1 });

    res.json({ records });
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ msg: 'Error fetching medical records', error: err.message });
  }
};

// Get single medical record
export const getMedicalRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.user.id;

    const record = await MedicalRecord.findOne({ _id: recordId, user: userId });

    if (!record) {
      return res.status(404).json({ msg: 'Record not found' });
    }

    res.json({ record });
  } catch (err) {
    console.error('Error fetching record:', err);
    res.status(500).json({ msg: 'Error fetching record', error: err.message });
  }
};

// Download medical record file
export const downloadMedicalRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.user.id;

    const record = await MedicalRecord.findOne({ _id: recordId, user: userId });

    if (!record) {
      return res.status(404).json({ msg: "Record not found" });
    }

    return res.redirect(record.filePath);

  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ msg: "Error downloading file", error: err.message });
  }
};


// Delete medical record
export const deleteMedicalRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    const userId = req.user.id;

    const record = await MedicalRecord.findOne({ _id: recordId, user: userId });

    if (!record) {
      return res.status(404).json({ msg: 'Record not found' });
    }

    // Delete file from server
    if (fs.existsSync(record.filePath)) {
      fs.unlinkSync(record.filePath);
    }

    // Delete record from database
    await MedicalRecord.deleteOne({ _id: recordId });

    res.json({ msg: 'Medical record deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: 'Error deleting record', error: err.message });
  }
};

// Get health information
export const getHealthInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    let healthInfo = await HealthInfo.findOne({ user: userId });

    if (!healthInfo) {
      // Create default health info if none exists
      healthInfo = new HealthInfo({ 
        user: userId,
        conditions: [],
        medications: [],
        allergies: []
      });
      await healthInfo.save();
    }

    res.json({ healthInfo });
  } catch (err) {
    console.error('Error fetching health info:', err);
    res.status(500).json({ msg: 'Error fetching health information', error: err.message });
  }
};

// Update health information
export const updateHealthInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conditions, medications, allergies } = req.body;

    let healthInfo = await HealthInfo.findOne({ user: userId });

    if (!healthInfo) {
      healthInfo = new HealthInfo({ user: userId });
    }

    if (conditions) healthInfo.conditions = conditions;
    if (medications) healthInfo.medications = medications;
    if (allergies) healthInfo.allergies = allergies;

    await healthInfo.save();

    res.json({
      msg: 'Health information updated successfully',
      healthInfo
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ msg: 'Error updating health information', error: err.message });
  }
};