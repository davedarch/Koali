const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files if needed
app.use(express.static('public'));

// Add your API routes
app.get('/api/example', (req, res) => {
  res.json({ message: 'This is an example API response' });
});

// For SPA routing (if applicable)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Development server running at http://localhost:${port}`);
}); 