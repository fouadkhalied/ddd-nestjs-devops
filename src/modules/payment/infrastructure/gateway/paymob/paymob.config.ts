export const paymobConfig = {
    apiKey: process.env.PAYMOB_API_KEY || '',
    integrationId: process.env.PAYMOB_INTEGRATION_ID || '',
    iframeId: process.env.PAYMOB_IFRAME_ID || '',
    hmacSecret: process.env.PAYMOB_HMAC_SECRET || '',
    successUrl: process.env.PAYMOB_SUCCESS_URL || 'http://localhost:3000/payment/success',
    cancelUrl: process.env.PAYMOB_CANCEL_URL || 'http://localhost:3000/payment/cancel',
  };