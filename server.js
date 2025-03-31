const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // To parse JSON bodies

// GitHub API Search Route
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    // GitHub API URL
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`;

    const response = await axios.get(url);
    const results = response.data.items.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
    }));

    res.json({ results });
  } catch (error) {
    console.error('Error fetching from GitHub:', error.message);
    res.status(500).json({ error: 'Failed to fetch results from GitHub' });
  }
});

// Route to handle selected repository
app.post('/selected-repo', (req, res) => {
  const selectedRepo = req.body;
  console.log('Selected Repo:', selectedRepo);

  // Perform any processing or saving of the selected repo
  // For example, saving to a database or logging

  res.json({ message: 'Repo successfully received', repo: selectedRepo });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
