export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({ 
    message: "Portfolio API is running",
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      "/api/health - Health check endpoint",
      "/api/accounts - Account management", 
      "/api/portfolio - Portfolio data"
    ],
    status: "Demo Mode - Database not connected"
  });
}
