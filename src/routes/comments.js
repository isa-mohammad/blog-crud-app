const router = require('express').Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// GET all comments for a post
router.get('/post/:postId', authenticate, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email')
      .select('-__v')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single comment
router.get('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name email')
      .populate('post', 'title')
      .select('-__v');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create comment
router.post('/', authenticate, async (req, res) => {
  try {
    const { body, postId, authorId } = req.body;
    if (!body || !postId || !authorId)
      return res.status(400).json({ error: 'body, postId, and authorId are required' });

    const [post, author] = await Promise.all([
      Post.findById(postId),
      User.findById(authorId),
    ]);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const comment = await Comment.create({ body, post: postId, author: authorId });
    await comment.populate([
      { path: 'author', select: 'name email' },
      { path: 'post', select: 'title' },
    ]);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update comment
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body) return res.status(400).json({ error: 'body is required' });

    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { body },
      { new: true, runValidators: true }
    )
      .populate('author', 'name email')
      .populate('post', 'title')
      .select('-__v');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE comment
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json({ message: 'Comment deleted', commentId: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
