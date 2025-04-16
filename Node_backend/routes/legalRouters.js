const express = require('express');
const router = express.Router();

// Get terms of service page
router.get('/terms', (req, res) => {
    res.render('legal/terms', {
        currentYear: new Date().getFullYear()
    });
});

// Get privacy policy page
router.get('/privacy', (req, res) => {
    res.render('legal/privacy', {
        currentYear: new Date().getFullYear()
    });
});

module.exports = router; 