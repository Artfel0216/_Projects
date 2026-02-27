import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: 'APP_USR-6719941859075376-022715-542e6867f703f32cd7e5e1aa5ba65466-2998057884' 
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionAmount } = body;

    const payment = new Payment(client);

    const result = await payment.create({
      body: {
        transaction_amount: Number(transactionAmount),
        description: 'Compra na Loja (SNEAKER)',
        payment_method_id: 'pix',
        payer: {
          email: 'comprador.teste.sneaker@gmail.com', 
          identification: {
            type: 'CPF',
            number: '12345678909' 
          }
        },
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Erro ao gerar PIX no Mercado Pago:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao processar pagamento' }, 
      { status: 500 }
    );
  }
}