const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  days: { type: String, required: true },
  time: { type: String, required: true },
  instructor: { type: String, required: true }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  beltLevel: { type: String, default: 'White' },
  phone: { type: String },
  status: { type: String, default: 'Active' },
  joinDate: { type: Date, default: Date.now }
});

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  markedBy: { type: String }
});
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }
});

module.exports = {
  Batch: mongoose.model('Batch', batchSchema),
  Student: mongoose.model('Student', studentSchema),
  Attendance: mongoose.model('Attendance', attendanceSchema),
  Fee: mongoose.model('Fee', feeSchema)
};
