const express = require('express');
const router = express.Router();
const sslScanner = require('../utils/sslScanner');
const headerScanner = require('../utils/headerScanner');
const portScanner = require('../utils/portScanner');

router.post('/', async (req, res) => {
  const { url } = req.body;
  console.log('Received URL:', url);  // ✅ Helpful debug log

  try {
    const sslResults = await sslScanner(url);
    const headerResults = await headerScanner(url);
    const portResults = await portScanner(url);

    res.json({
      ssl: sslResults,
      headers: headerResults,
      ports: portResults,
    });
  } catch (error) {
    console.error('Scanning failed:', error);  // ✅ Print full error
    res.status(500).json({ error: 'Scanning failed', details: error.message });
  }
});


module.exports = router;
