const mongoose = require('mongoose');

const selectedRepoSchema = new mongoose.Schema({
  email: { type: String, required: true },
  repo: {
    name: String,
    url: String,
    description: String,
    stars: Number,
  },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SelectedRepo', selectedRepoSchema);