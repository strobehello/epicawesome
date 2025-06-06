require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

const { MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_CLUSTER, MONGO_APPNAME } = process.env;

const uri = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority&appName=${MONGO_APPNAME}`;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection failed:", err));

const visitorSchema = new mongoose.Schema({
  ip: String,
  city: String,
  region: String,
  country: String,
  isp: String,
  timezone: String,
  browser: String,
  latitude: String,
  longitude: String
});

const postSchema = new mongoose.Schema({
  username: String,
  text: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema, 'ethan-visitor-info');
const Post = mongoose.model('Post', postSchema, 'ethan-imageboard-posts');

app.post('/api/visitors', async (req, res) => {
  try {
    const newVisitor = new Visitor(req.body);
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS working' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});