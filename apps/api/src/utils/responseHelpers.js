// Response helpers for consistent API responses

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function createSuccessResponse(data = null, status = 200) {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    source: 'Cloudflare D1'
  };

  if (data !== null) {
    response.data = data;
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export function createErrorResponse(error, status = 500) {
  const response = {
    success: false,
    error: typeof error === 'string' ? error : error.message,
    timestamp: new Date().toISOString()
  };

  // Add more details in development
  if (typeof error === 'object' && error.stack) {
    console.error('API Error:', error);
  }

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export function createValidationErrorResponse(message) {
  return createErrorResponse(message, 400);
}

export function createNotFoundResponse(message = 'Resource not found') {
  return createErrorResponse(message, 404);
}

export function createMethodNotAllowedResponse() {
  return createErrorResponse('Method not allowed', 405);
}