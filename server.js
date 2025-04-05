const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const SelectedRepo = require('./models/Search');
const Search = require('./models/SearchedQuery');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// 🔍 GitHub Search Endpoint
app.get('/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
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
    console.error('GitHub fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch results from GitHub' });
  }
});

// 📝 Save Search Query
app.post('/save-search', async (req, res) => {
  const { email, query } = req.body;

  if (!email || !query) {
    return res.status(400).json({ error: 'Email and query are required' });
  }

  try {
    await Search.create({ email, query });

    // Keep only 5 most recent searches
    const count = await Search.countDocuments({ email });
    if (count > 5) {
      const excess = await Search.find({ email }).sort({ timestamp: 1 }).limit(count - 5);
      const excessIds = excess.map(doc => doc._id);
      await Search.deleteMany({ _id: { $in: excessIds } });
    }

    res.json({ message: 'Search query saved' });
  } catch (error) {
    console.error('Save search error:', error.message);
    res.status(500).json({ error: 'Failed to save search query' });
  }
});

// 📥 Save Selected Repo
app.post('/selected-repo', async (req, res) => {
  const { email, name, url, description, stars } = req.body;

  if (!email || !name || !url) {
    return res.status(400).json({ error: 'Email, name, and url are required' });
  }

  try {
    console.log(`📦 Selected repo saved: ${name} by ${email}`);

    await SelectedRepo.create({
      email,
      repo: { name, url, description, stars },
    });

    // Keep only 5 most recent selected repos
    const count = await SelectedRepo.countDocuments({ email });
    if (count > 5) {
      const excess = await SelectedRepo.find({ email }).sort({ timestamp: 1 }).limit(count - 5);
      const excessIds = excess.map(doc => doc._id);
      await SelectedRepo.deleteMany({ _id: { $in: excessIds } });
    }

    res.json({ message: 'Repo saved successfully' });
  } catch (error) {
    console.error('Save selected repo error:', error.message);
    res.status(500).json({ error: 'Failed to save selected repo' });
  }
});

// 📜 Get Search History
app.get('/search-history', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const history = await Search.find({ email }).sort({ timestamp: -1 }).limit(5);
    res.json({ history });
  } catch (error) {
    console.error('Fetch search history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 📜 Get Selected Repo History
app.get('/selected-repo-history', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const history = await SelectedRepo.find({ email }).sort({ timestamp: -1 }).limit(5);
    res.json({ history });
  } catch (error) {
    console.error('Fetch selected repo history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch selected repo history' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
