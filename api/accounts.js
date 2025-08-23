// API Accounts Endpoint
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests for now
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return demo accounts data
  return res.status(200).json({
    success: true,
    data: [{
      id: 'demo-account',
      name: 'Demo Account',
      accountType: 'SECURITIES',
      currency: 'USD',
      isDefault: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]
  });
}