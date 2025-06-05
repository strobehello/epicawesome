require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const dbName = process.env.MONGO_DB;
const cluster = process.env.MONGO_CLUSTER;
const appName = process.env.MONGO_APPNAME

const uri = `mongodb+srv://${user}:${pass}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=${appName}`;

console.log(uri)

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const visitorSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  isp: String,
  timezone: String,
  browser: String,
});

const Visitor = mongoose.model('Visitor', visitorSchema, 'ethan-visitor-info');

app.post('/api/visitors', async (req, res) => {
  try {
    const newVisitor = new Visitor(req.body);
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});