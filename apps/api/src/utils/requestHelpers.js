// Request helpers for parsing and validation

export function parsePathParts(url) {
  return new URL(url).pathname.split('/').filter(Boolean);
}

export function parseAccountId(pathParts) {
  // Expected format: ['api', 'accounts', 'account-id', ...]
  return pathParts.length >= 3 ? pathParts[2] : null;
}

export function parseQueryParams(url) {
  const urlObj = new URL(url);
  const params = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

export function validateAccountData(accountData) {
  const errors = [];

  if (!accountData.name || typeof accountData.name !== 'string' || accountData.name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  if (accountData.currency && typeof accountData.currency !== 'string') {
    errors.push('Currency must be a string');
  }

  if (accountData.tags !== undefined) {
    if (!Array.isArray(accountData.tags)) {
      errors.push('Tags must be an array');
    } else {
      const invalidTags = accountData.tags.filter(tag => 
        typeof tag !== 'string' || tag.trim() === ''
      );
      if (invalidTags.length > 0) {
        errors.push('All tags must be non-empty strings');
      }
    }
  }

  if (accountData.isDefault !== undefined && typeof accountData.isDefault !== 'boolean') {
    errors.push('isDefault must be a boolean');
  }

  if (accountData.isActive !== undefined && typeof accountData.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  return errors;
}