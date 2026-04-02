import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { randomUUID } from 'node:crypto';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { transactionAmount, description, payer } = body;

    if (!transactionAmount || Number(transactionAmount) <= 0) {
      return NextResponse.json({ error: 'Valor inválido' }, { status: 400 });
    }

    const payment = new Payment(client);
    const idempotencyKey = randomUUID();

    const result = await payment.create({
      body: {
        transaction_amount: Number(transactionAmount),
        description: description || 'Compra na Loja',
        payment_method_id: 'pix',
        notification_url: `${process.env.NEXT_URL}/api/webhooks/mercadopago`,
        payer: {
          email: payer?.email || session?.user?.email || 'comprador@email.com',
          first_name: session?.user?.name?.split(' ')[0] || 'Cliente',
          identification: {
            type: 'CPF',
            number: payer?.cpf?.replace(/\D/g, '') || '00000000000'
          }
        },
      },
      requestOptions: { idempotencyKey }
    });

    return NextResponse.json({ 
      success: true, 
      id: result.id,
      qr_code: result.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
      status: result.status 
    });

  } catch (error: any) {
    console.error('MP_ERROR:', error?.message || error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar pagamento' }, 
      { status: 500 }
    );
  }
}