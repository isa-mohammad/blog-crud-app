const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// GET all users
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user with their posts
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await Post.find({ author: user._id }).select('title tags published createdAt');
    res.json({ ...user.toObject(), posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email, bio, role } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

    const user = await User.create({ name, email, bio, role });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// PUT update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, email, bio, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, bio, role },
      { new: true, runValidators: true }
    ).select('-__v');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user (also removes their posts and comments)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const Comment = require('../models/Comment');
    const userPosts = await Post.find({ author: req.params.id }).select('_id');
    const postIds = userPosts.map((p) => p._id);

    await Promise.all([
      Post.deleteMany({ author: req.params.id }),
      Comment.deleteMany({ $or: [{ author: req.params.id }, { post: { $in: postIds } }] }),
    ]);

    res.json({ message: 'User and related data deleted', userId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
