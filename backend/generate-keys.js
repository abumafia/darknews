const crypto = require('crypto');
const fs = require('fs');

function generateVAPIDKeys() {
  // ECDH curve (prime256v1 P-256 curve)
  const curve = crypto.createECDH('prime256v1');
  curve.generateKeys();

  // Base64 URL-safe formatga o'tkazish
  const publicKey = curve.getPublicKey('base64url');
  const privateKey = curve.getPrivateKey('base64url');

  return { publicKey, privateKey };
}

const vapidKeys = generateVAPIDKeys();

console.log('VAPID Public Key:', vapidKeys.publicKey);
console.log('VAPID Private Key:', vapidKeys.privateKey);

// Faylga saqlash (ixtiyoriy)
fs.writeFileSync('vapid-keys.json', JSON.stringify(vapidKeys, null, 2));
console.log('Keys saved to vapid-keys.json');