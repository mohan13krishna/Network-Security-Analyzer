const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const sslScanner = require('../utils/sslScanner');
const headerScanner = require('../utils/headerScanner');
const portScanner = require('../utils/portScanner');
const Scan = require('../models/Scan');
const emailService = require('../utils/email');
const { protect, authorize } = require('../middleware/auth');

// Calculate security score based on scan results
const calculateSecurityScore = (results) => {
  let score = 100;
  const vulnerabilities = [];

  // SSL Checks
  const ssl = results.ssl;
  if (!ssl) {
    score -= 30;
    vulnerabilities.push("❌ SSL certificate missing or invalid.");
  } else {
    const expiry = new Date(ssl.valid_to);
    const now = new Date();
    const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 30) {
      score -= 15;
      vulnerabilities.push("⚠️ SSL certificate expires in less than 30 days.");
    }
    
    if (!['TLSv1.3', 'TLSv1.2'].includes(ssl.protocol)) {
      score -= 20;
      vulnerabilities.push(`❌ Insecure SSL protocol used: ${ssl.protocol}`);
    }
  }

  // Header Checks
  const headers = results.headers || {};
  const requiredHeaders = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "x-xss-protection"
  ];
  
  requiredHeaders.forEach(header => {
    if (!headers[header]) {
      score -= 8;
      vulnerabilities.push(`⚠️ Missing security header: ${header}`);
    }
  });

  // Open Ports
  const riskyPorts = [21, 22, 23, 25, 110, 135, 139, 143, 3389];
  (results.ports || []).forEach(port => {
    if (riskyPorts.includes(port)) {
      score -= 10;
      vulnerabilities.push(`🛑 Risky port open: ${port}`);
    }
  });

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Determine risk level
  let riskLevel = 'Low';
  if (score < 30) riskLevel = 'Critical';
  else if (score < 50) riskLevel = 'High';
  else if (score < 70) riskLevel = 'Medium';

  return { score, vulnerabilities, riskLevel };
};

// @route   POST /api/scan
// @desc    Perform security scan
// @access  Private
router.post('/', protect, [
  body('url').trim().isLength({ min: 1 }).withMessage('URL is required')
    .matches(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).withMessage('Please enter a valid domain name')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { url } = req.body;
    const startTime = Date.now();

    console.log(`Starting scan for ${url} by user ${req.user.name}`);

    // Create scan record
    const scan = new Scan({
      user: req.user.id,
      url: url,
      status: 'Pending'
    });
    await scan.save();

    try {
      // Perform scans
      const [sslResults, headerResults, portResults] = await Promise.all([
        sslScanner(url).catch(err => ({ error: err.message })),
        headerScanner(url).catch(err => ({ error: err.message })),
        portScanner(url).catch(err => ({ error: err.message }))
      ]);

      const results = {
        ssl: sslResults.error ? null : sslResults,
        headers: headerResults.error ? {} : headerResults,
        ports: portResults.error ? [] : portResults
      };

      // Calculate security metrics
      const { score, vulnerabilities, riskLevel } = calculateSecurityScore(results);
      const scanDuration = Date.now() - startTime;

      // Update scan record
      scan.results = results;
      scan.securityScore = score;
      scan.riskLevel = riskLevel;
      scan.results.vulnerabilities = vulnerabilities;
      scan.scanDuration = scanDuration;
      scan.status = 'Completed';
      await scan.save();

      // Send email notification
      try {
        await emailService.sendScanReport(req.user, {
          url,
          results,
          securityScore: score,
          riskLevel,
          vulnerabilities
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the scan if email fails
      }

      res.json({
        success: true,
        message: 'Scan completed successfully',
        data: {
          scanId: scan._id,
          url,
          ssl: results.ssl,
          headers: results.headers,
          ports: results.ports,
          vulnerabilities,
          securityScore: score,
          riskLevel,
          scanDuration
        }
      });

    } catch (scanError) {
      console.error('Scanning failed:', scanError);
      
      // Update scan record with error
      scan.status = 'Failed';
      scan.errorMessage = scanError.message;
      await scan.save();

      res.status(500).json({
        success: false,
        message: 'Scanning failed',
        error: scanError.message
      });
    }

  } catch (error) {
    console.error('Scan endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during scan'
    });
  }
});

// @route   GET /api/scan/history
// @desc    Get user's scan history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scans = await Scan.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-results.headers -__v');

    const total = await Scan.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        scans,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving scan history'
    });
  }
});

// @route   GET /api/scan/:id
// @desc    Get specific scan details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan not found'
      });
    }

    res.json({
      success: true,
      data: scan
    });
  } catch (error) {
    console.error('Get scan details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving scan details'
    });
  }
});

// @route   GET /api/scan/analytics/overview
// @desc    Get scan analytics (Developer only)
// @access  Private (Developer)
router.get('/analytics/overview', protect, authorize('Developer'), async (req, res) => {
  try {
    const totalScans = await Scan.countDocuments();
    const completedScans = await Scan.countDocuments({ status: 'Completed' });
    const failedScans = await Scan.countDocuments({ status: 'Failed' });
    
    // Get scans by risk level
    const riskLevelStats = await Scan.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    // Get recent scans
    const recentScans = await Scan.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-results.headers');

    // Get average security score
    const avgScoreResult = await Scan.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, avgScore: { $avg: '$securityScore' } } }
    ]);

    const avgSecurityScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    res.json({
      success: true,
      data: {
        totalScans,
        completedScans,
        failedScans,
        avgSecurityScore,
        riskLevelStats,
        recentScans
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving analytics'
    });
  }
});

module.exports = router;