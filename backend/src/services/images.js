const axios = require('axios');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Build a Google Maps Static API Street View URL for a given address.
 * Returns a URL string (does NOT download the image — the frontend uses it directly,
 * and we pass it to Claude as a URL for vision scoring).
 */
function buildStreetViewUrl(address) {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const params = new URLSearchParams({
    size: '640x480',
    location: address,
    fov: '90',
    heading: '0',
    pitch: '0',
    key: GOOGLE_API_KEY,
  });
  return `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;
}

/**
 * Build a Google Maps Static API satellite image URL for a given address.
 */
function buildSatelliteUrl(address) {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not set');
  const params = new URLSearchParams({
    center: address,
    zoom: '19',
    size: '640x480',
    maptype: 'satellite',
    key: GOOGLE_API_KEY,
  });
  return `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;
}

/**
 * Fetch image as base64 so we can pass it to Claude vision.
 */
async function fetchImageAsBase64(url) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  const contentType = response.headers['content-type'] || 'image/jpeg';
  return { base64, mediaType: contentType.split(';')[0] };
}

module.exports = { buildStreetViewUrl, buildSatelliteUrl, fetchImageAsBase64 };
