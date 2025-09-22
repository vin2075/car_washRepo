const QRCode = require('qrcode'); // npm i qrcode

async function generateQRCodeDataURL(text) {
  // returns a data:image/png;base64,... string
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'H' });
}

module.exports = { generateQRCodeDataURL };
