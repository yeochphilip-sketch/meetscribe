// PKCE utility functions - generate code verifier and challenge manually

function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = generateRandomString(128);
  
  // Generate code challenge using SHA-256
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64url
  const hashArray = Array.from(new Uint8Array(hashBuffer as any));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  const codeChallenge = hashBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return { codeVerifier, codeChallenge };
}

// For server-side usage (Node.js crypto)
export function generatePKCEServer(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = require('crypto').randomBytes(64).toString('base64url');
  const codeChallenge = require('crypto')
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}
