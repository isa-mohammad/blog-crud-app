const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// GET all posts (with author info, optional tag filter)
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = {};
    if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
    if (req.query.published !== undefined) filter.published = req.query.published === 'true';

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .select('-__v')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post with author and comments
router.get('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email bio')
      .select('-__v');
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'name email')
      .select('-__v')
      .sort({ createdAt: 1 });

    res.json({ ...post.toObject(), comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create post
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, content, tags, authorId, published } = req.body;
    if (!title || !content || !authorId)
      return res.status(400).json({ error: 'title, content, and authorId are required' });

    const author = await User.findById(authorId);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const post = await Post.create({ title, content, tags, author: authorId, published });
    await post.populate('author', 'name email');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update post
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { title, content, tags, published } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, published },
      { new: true, runValidators: true }
    )
      .populate('author', 'name email')
      .select('-__v');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post (also removes its comments)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: 'Post and its comments deleted', postId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
