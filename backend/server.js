const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Mock database
let db = {
  articles: [
    { 
      id: 1, 
      title: "Birinchi yangilik", 
      content: "Bu birinchi yangilikning to'liq matni...", 
      excerpt: "Birinchi yangilik qisqacha...",
      likes: 0, 
      likedBy: [], 
      comments: [],
      createdAt: new Date().toISOString(),
      views: 0
    },
    { 
      id: 2, 
      title: "Ikkinchi yangilik", 
      content: "Bu ikkinchi yangilikning to'liq matni...", 
      excerpt: "Ikkinchi yangilik qisqacha...",
      likes: 0, 
      likedBy: [], 
      comments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      views: 0
    }
  ]
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API endpoints
app.get('/api/articles', (req, res) => {
  res.json(db.articles);
});

// Corrected search endpoint
app.get('/api/articles/search', (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 2) {
    return res.status(400).json({ error: 'Search query must be at least 2 characters' });
  }

  const results = db.articles.filter(article => {
    return article.title.toLowerCase().includes(query.toLowerCase()) || 
           article.content.toLowerCase().includes(query.toLowerCase());
  }).map(article => ({
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    views: article.views,
    createdAt: article.createdAt
  }));

  res.json(results);
});

app.get('/api/articles/:id', (req, res) => {
  const article = db.articles.find(a => a.id === parseInt(req.params.id));
  if (article) {
    article.views++;
    res.json(article);
  } else {
    res.status(404).send('Article not found');
  }
});

app.post('/api/articles/:id/like', (req, res) => {
  const articleId = parseInt(req.params.id);
  const userId = req.body.userId;
  
  const article = db.articles.find(a => a.id === articleId);
  if (!article) return res.status(404).send('Article not found');
  
  const likeIndex = article.likedBy.indexOf(userId);
  
  if (likeIndex === -1) {
    // Like
    article.likes++;
    article.likedBy.push(userId);
    res.json({ likes: article.likes, isLiked: true });
  } else {
    // Unlike
    article.likes--;
    article.likedBy.splice(likeIndex, 1);
    res.json({ likes: article.likes, isLiked: false });
  }
});

app.post('/api/articles/:id/comment', (req, res) => {
  const articleId = parseInt(req.params.id);
  const { userId, username, text } = req.body;
  
  const article = db.articles.find(a => a.id === articleId);
  if (!article) return res.status(404).send('Article not found');
  
  const newComment = {
    id: Date.now(),
    userId,
    username,
    text,
    date: new Date().toISOString()
  };
  
  article.comments.unshift(newComment);
  res.json(newComment);
});

// Admin endpoints
let stats = {
  visits: 0,
  articlesCount: 2,
  commentsCount: 0
};

app.use((req, res, next) => {
  stats.visits++;
  next();
});

app.get('/api/admin/stats', (req, res) => {
  res.json({
    ...stats,
    articlesCount: db.articles.length,
    commentsCount: db.articles.reduce((acc, article) => acc + article.comments.length, 0)
  });
});

app.post('/api/admin/articles', (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).send('Title and content are required');
  }
  
  const newArticle = {
    id: Date.now(),
    title,
    content,
    excerpt: content.substring(0, 100) + '...',
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString(),
    views: 0
  };
  
  db.articles.unshift(newArticle);
  stats.articlesCount++;
  
  res.status(201).json(newArticle);
});

app.delete('/api/admin/articles/:id', (req, res) => {
  const articleId = parseInt(req.params.id);
  const articleIndex = db.articles.findIndex(a => a.id === articleId);
  
  if (articleIndex === -1) {
    return res.status(404).send('Article not found');
  }
  
  stats.commentsCount -= db.articles[articleIndex].comments.length;
  db.articles.splice(articleIndex, 1);
  stats.articlesCount--;
  
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});