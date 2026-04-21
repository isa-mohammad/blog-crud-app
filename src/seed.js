require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  console.log('Cleared existing data');

  const hash = await bcrypt.hash('password123', 10);
  const users = [
    { name: 'Alice Johnson', email: 'alice@example.com', password: hash, bio: 'Full-stack developer and coffee enthusiast.', role: 'admin' },
    { name: 'Bob Smith', email: 'bob@example.com', password: hash, bio: 'Blogger and travel lover.', role: 'user' },
    { name: 'Carol White', email: 'carol@example.com', password: hash, bio: 'Tech writer and open source contributor.', role: 'user' },
  ];

  const createdUsers = await User.insertMany(users);
  const [alice, bob, carol] = createdUsers;
  console.log('Seeded users');

  const posts = [
    {
      title: 'Getting Started with Node.js',
      content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on the server side, making it perfect for building scalable network applications.',
      tags: ['nodejs', 'javascript', 'backend'],
      author: alice._id,
      published: true,
    },
    {
      title: 'My Travels in Japan',
      content: 'Japan is a fascinating country that blends ancient traditions with cutting-edge technology. From the bustling streets of Tokyo to the serene temples of Kyoto, every corner has a story.',
      tags: ['travel', 'japan', 'culture'],
      author: bob._id,
      published: true,
    },
    {
      title: 'A Beginner\'s Guide to MongoDB',
      content: 'MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. Unlike traditional relational databases, it doesn\'t require a predefined schema.',
      tags: ['mongodb', 'database', 'nosql'],
      author: carol._id,
      published: true,
    },
    {
      title: 'Draft: Upcoming Post on React Hooks',
      content: 'React Hooks were introduced in React 16.8 and allow you to use state and other React features in functional components...',
      tags: ['react', 'javascript', 'frontend'],
      author: alice._id,
      published: false,
    },
  ];

  const createdPosts = await Post.insertMany(posts);
  const [nodePost, japanPost, mongoPost] = createdPosts;
  console.log('Seeded posts');

  const comments = [
    { body: 'Great introduction! Really helped me get started.', post: nodePost._id, author: bob._id },
    { body: 'Could you cover async/await in the next post?', post: nodePost._id, author: carol._id },
    { body: 'Japan is on my bucket list! Thanks for sharing.', post: japanPost._id, author: alice._id },
    { body: 'The photos sound amazing. Did you visit Osaka too?', post: japanPost._id, author: carol._id },
    { body: 'Very clear explanation of document-based storage!', post: mongoPost._id, author: alice._id },
    { body: 'How does MongoDB compare to PostgreSQL for complex queries?', post: mongoPost._id, author: bob._id },
  ];

  await Comment.insertMany(comments);
  console.log('Seeded comments');

  console.log('\nSeed complete:');
  console.log(`  ${createdUsers.length} users`);
  console.log(`  ${createdPosts.length} posts`);
  console.log(`  ${comments.length} comments`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
