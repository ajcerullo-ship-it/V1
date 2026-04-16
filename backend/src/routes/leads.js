const express = require('express');
const { getLeads, clearLeads } = require('../services/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const leads = getLeads();
  res.json(leads);
});

router.delete('/', (req, res) => {
  clearLeads();
  res.json({ message: 'All leads cleared' });
});

// Export scored leads as CSV
router.get('/export', (req, res) => {
  const leads = getLeads();
  const scored = leads.filter((l) => l.distressScore !== null);

  if (!scored.length) {
    return res.status(404).json({ error: 'No scored leads to export' });
  }

  const headers = [
    'ID',
    'Owner Name',
    'Address',
    'City',
    'State',
    'ZIP',
    'Distress Score',
    'Flags',
    'Reasoning',
    'Street View URL',
    'Satellite URL',
    'Scored At',
  ];

  const rows = scored.map((l) => [
    l.id,
    l.ownerName,
    l.address,
    l.city,
    l.state,
    l.zip,
    l.distressScore,
    (l.flags || []).join('; '),
    (l.reasoning || '').replace(/"/g, '""'),
    l.streetViewUrl || '',
    l.satelliteUrl || '',
    l.scoredAt || '',
  ]);

  const csvLines = [headers, ...rows]
    .map((row) => row.map((v) => `"${v}"`).join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="scored_leads.csv"');
  res.send(csvLines);
});

module.exports = router;
