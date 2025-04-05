// models/SearchedQuery.js
const mongoose = require('mongoose');

const searchedQuerySchema = new mongoose.Schema({
  email: String,
  query: String,
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SearchedQuery', searchedQuerySchema);
