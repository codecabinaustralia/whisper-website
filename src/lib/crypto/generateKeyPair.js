export async function generateKeyPair(uid) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Helper to encode ArrayBuffer to base64 safely
  const toBase64 = (buffer) => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return window.btoa(binary);
  };

  // Format as PEM with line breaks every 64 chars
  const toPEM = (base64, label) => {
    const lines = base64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  };

  const exportedPublic = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const base64Public = toBase64(exportedPublic);
  const pemPublic = toPEM(base64Public, 'PUBLIC KEY');

  const exportedPrivate = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const base64Private = toBase64(exportedPrivate);
  const pemPrivate = toPEM(base64Private, 'PRIVATE KEY');

  // Store private key in localStorage
  localStorage.setItem(`whisper-privateKey-${uid}`, pemPrivate);

  return { publicKey: pemPublic };
}
