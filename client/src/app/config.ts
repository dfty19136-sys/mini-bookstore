// Local server while developing, Vercel server after publishing
const isLocal = location.hostname === 'localhost';

export const API_URL = isLocal
  ? 'http://localhost:3000/api'
  : 'https://REPLACE-ME.vercel.app/api';