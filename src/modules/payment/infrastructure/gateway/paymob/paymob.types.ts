export interface PaymobConfig {
    apiKey: string;
    integrationId: string;
    iframeId: string;
    hmacSecret: string;
    successUrl: string;
    cancelUrl: string;
  }
  
  export interface PaymobCheckoutSession {
    url: string;
    id: string;
  }
  
  export interface PaymobWebhookEvent {
    type: string;
    data: {
      object: any;
    };
  }
  