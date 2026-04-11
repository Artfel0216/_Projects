import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

const paymentInstance = new Payment(client);

export async function POST(request: Request) {
  try {
    const { 
      transaction_amount, 
      token, 
      installments, 
      payment_method_id, 
      issuer_id, 
      payer 
    } = await request.json();

    const { status, id } = await paymentInstance.create({
      body: {
        transaction_amount,
        token,
        description: 'Plano Wegym Pro',
        installments: Number(installments),
        payment_method_id,
        issuer_id,
        payer: { email: payer.email }
      }
    });

    return NextResponse.json({ status, id }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro' }, 
      { status: 400 }
    );
  }
}