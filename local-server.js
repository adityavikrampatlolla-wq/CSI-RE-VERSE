require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const stateHandler = require('./api/state.js');

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON body

// Serve static files (HTML, CSS, JS, Audio)
app.use(express.static(__dirname));

// Map /api/state to the serverless function handler
app.all('/api/state', async (req, res) => {
  await stateHandler(req, res);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`🚀 Local Server Running!`);
  console.log(`🔗 http://localhost:${PORT}/chapter3_air.html`);
  console.log(`================================\n`);
  console.log(`Press Ctrl+C to stop the server.`);
});
