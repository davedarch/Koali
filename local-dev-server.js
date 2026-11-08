const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 4480; // pinned: see vault reference.local-ports.md

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mirror the Vercel serverless functions locally
app.post('/api/submit-feedback', require('./api/submit-feedback.js'));
app.get('/api/hello', require('./api/hello.js'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Koali dev server running at http://localhost:${port}`);
});
