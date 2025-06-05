require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
  allowedHeaders: ['Content-Type', 'Authorization'],     
}));

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
  latitude: String,
  longitude: String
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

const postSchema = new mongoose.Schema({
  username: String,
  text: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema, 'ethan-imageboard-posts');

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});