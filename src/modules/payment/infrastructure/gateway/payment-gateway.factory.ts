import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from './payment-gateway.interface';
import { PaymentMethod } from '../../domain/value-object/payment-method.enum';
import { PaymobGateway } from './paymob/paymob.gateway';
import { StripeGateway } from './stripe/stripe.gateway';
import { paymobConfig } from './paymob/paymob.config';
import { stripeConfig } from './stripe/stripe.config';

@Injectable()
export class PaymentGatewayFactory {
  private gateways: Map<PaymentMethod, IPaymentGateway>;

  constructor() {
    this.gateways = new Map();
    this.gateways.set(PaymentMethod.PAYMOB, new PaymobGateway(paymobConfig));
    this.gateways.set(PaymentMethod.STRIPE, new StripeGateway(stripeConfig));
  }

  getGateway(method: PaymentMethod): IPaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new Error(`Payment gateway not found for method: ${method}`);
    }
    return gateway;
  }
}