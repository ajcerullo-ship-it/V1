const express = require('express');
const { getLeads, saveLead } = require('../services/storage');
const { buildStreetViewUrl, buildSatelliteUrl } = require('../services/images');
const { scoreProperty } = require('../services/scorer');

const router = express.Router();

// Score a single lead by ID
router.post('/:id', async (req, res) => {
  const leads = getLeads();
  const lead = leads.find((l) => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  if (!lead.fullAddress) {
    return res.status(400).json({ error: 'Lead has no address' });
  }

  try {
    // Build image URLs
    const streetViewUrl = buildStreetViewUrl(lead.fullAddress);
    const satelliteUrl = buildSatelliteUrl(lead.fullAddress);

    // Update status to fetching
    lead.status = 'scoring';
    lead.streetViewUrl = streetViewUrl;
    lead.satelliteUrl = satelliteUrl;
    saveLead(lead);

    // Score via Claude
    const result = await scoreProperty(streetViewUrl, satelliteUrl);

    lead.distressScore = result.distressScore;
    lead.flags = result.flags;
    lead.reasoning = result.reasoning;
    lead.status = 'scored';
    lead.scoredAt = new Date().toISOString();
    saveLead(lead);

    res.json(lead);
  } catch (err) {
    console.error(`Error scoring lead ${req.params.id}:`, err.message);
    lead.status = 'error';
    lead.errorMessage = err.message;
    saveLead(lead);
    res.status(500).json({ error: err.message, lead });
  }
});

// Score all pending leads
router.post('/', async (req, res) => {
  const leads = getLeads();
  const pending = leads.filter((l) => l.status === 'pending' || l.status === 'error');

  if (!pending.length) {
    return res.json({ message: 'No pending leads to score', scored: 0 });
  }

  // Start scoring in background, respond immediately
  res.json({ message: `Started scoring ${pending.length} leads`, total: pending.length });

  // Process sequentially to avoid rate limits
  for (const lead of pending) {
    try {
      const streetViewUrl = buildStreetViewUrl(lead.fullAddress);
      const satelliteUrl = buildSatelliteUrl(lead.fullAddress);

      lead.status = 'scoring';
      lead.streetViewUrl = streetViewUrl;
      lead.satelliteUrl = satelliteUrl;
      saveLead(lead);

      const result = await scoreProperty(streetViewUrl, satelliteUrl);
      lead.distressScore = result.distressScore;
      lead.flags = result.flags;
      lead.reasoning = result.reasoning;
      lead.status = 'scored';
      lead.scoredAt = new Date().toISOString();
      saveLead(lead);
    } catch (err) {
      console.error(`Error scoring lead ${lead.id}:`, err.message);
      lead.status = 'error';
      lead.errorMessage = err.message;
      saveLead(lead);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }
});

module.exports = router;
