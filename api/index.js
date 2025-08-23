// Vercel serverless function for the portfolio API
// This file provides a simple API for the portfolio app

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // For demo mode without database
    if (!process.env.DATABASE_URL) {
      // Return mock data for common endpoints
      if (req.url.includes('/portfolio')) {
        return res.json({
          success: true,
          data: {
            totalValue: 0,
            totalCost: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0,
            lastUpdated: new Date(),
            holdings: []
          }
        });
      }
      
      if (req.url.includes('/accounts')) {
        return res.json({
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
      
      if (req.url.includes('/health')) {
        return res.json({ status: 'OK (Demo Mode)', timestamp: new Date().toISOString() });
      }
      
      // Default demo response
      return res.json({ 
        success: true, 
        message: 'API running in demo mode. Configure DATABASE_URL to enable full functionality.',
        timestamp: new Date().toISOString()
      });
    }

    // If we have a database URL, use the actual API
    // This would require the API to be restructured for serverless
    return res.json({ 
      success: false, 
      message: 'Full API functionality not yet implemented for serverless deployment' 
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};