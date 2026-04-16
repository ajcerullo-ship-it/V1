const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const { saveLeads } = require('../services/storage');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Common Propstream column name variations
const ADDRESS_KEYS = ['property address', 'address', 'street address', 'mailing address'];
const CITY_KEYS = ['city', 'mailing city', 'property city'];
const STATE_KEYS = ['state', 'mailing state', 'property state'];
const ZIP_KEYS = ['zip', 'zip code', 'mailing zip', 'postal code', 'property zip'];
const OWNER_KEYS = ['owner name', 'owner', 'name', 'contact name'];

function findKey(record, candidates) {
  const lower = Object.keys(record).reduce((acc, k) => {
    acc[k.toLowerCase().trim()] = k;
    return acc;
  }, {});
  for (const c of candidates) {
    if (lower[c]) return record[lower[c]];
  }
  return '';
}

router.post('/', upload.single('csv'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const records = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) return res.status(400).json({ error: 'CSV is empty' });

    const leads = records.map((record) => {
      const address = findKey(record, ADDRESS_KEYS);
      const city = findKey(record, CITY_KEYS);
      const state = findKey(record, STATE_KEYS);
      const zip = findKey(record, ZIP_KEYS);
      const ownerName = findKey(record, OWNER_KEYS);

      const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

      return {
        id: uuidv4(),
        address,
        city,
        state,
        zip,
        fullAddress,
        ownerName,
        rawData: record,
        status: 'pending', // pending | fetching | scoring | scored | error
        streetViewUrl: null,
        satelliteUrl: null,
        distressScore: null,
        flags: [],
        reasoning: null,
        createdAt: new Date().toISOString(),
      };
    });

    const saved = saveLeads(leads);
    res.json({ count: leads.length, leads });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
