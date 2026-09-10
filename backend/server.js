const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { Batch, Student, Attendance, Fee } = require('./models/Models');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected 🥋'))
  .catch(err => console.error('Database connection error:', err));

app.get('/api/batches', async (req, res) => {
  try {
    const batches = await Batch.find();
    res.json(batches);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/batches', async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/students', async (req, res) => {
  try {
    const { batchId } = req.query;
    let query = batchId ? { batchId } : {};
    const students = await Student.find(query).populate('batchId');
    res.json(students);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/students', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const records = req.body;
    for (let record of records) {
      await Attendance.findOneAndUpdate(
        { studentId: record.studentId, date: record.date },
        { status: record.status, batchId: record.batchId },
        { upsert: true, new: true }
      );
    }
    res.json({ message: 'Attendance saved successfully!' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.get('/api/fees', async (req, res) => {
  try {
    const fees = await Fee.find().populate('studentId');
    res.json(fees);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/fees', async (req, res) => {
  try {
    const newFee = new Fee(req.body);
    await newFee.save();
    res.status(201).json(newFee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.patch('/api/fees/:id', async (req, res) => {
  try {
    const updatedFee = await Fee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedFee);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));

const path = require('path');

// Serve the frontend's static build files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all route to serve the React app for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});
