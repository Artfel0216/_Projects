import { MercadoPagoConfig, Payment } from 'mercadopago';
import type { PaymentInput } from '@/lib/validation';

function getPaymentInstance(): Payment {
  const mpToken = process.env.MP_ACCESS_TOKEN;
  if (!mpToken) {
    throw new Error('MP_ACCESS_TOKEN não definido no .env');
  }
  const client = new MercadoPagoConfig({
    accessToken: mpToken,
    options: { timeout: 5000 },
  });
  return new Payment(client);
}

export const paymentService = {
  async process(data: PaymentInput) {
    const paymentInstance = getPaymentInstance();
    const { status, id } = await paymentInstance.create({
      body: {
        transaction_amount: data.transaction_amount,
        token: data.token,
        description: 'Plano Wegym Pro',
        installments: Number(data.installments),
        payment_method_id: data.payment_method_id,
        issuer_id: data.issuer_id,
        payer: { email: data.payer.email },
      },
    });

    return { status, id };
  },
};
