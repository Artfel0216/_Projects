import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentId = body.data?.id ?? body.id;

    if (paymentId) {
      // Em produção: atualizar status do pagamento via API do Mercado Pago
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[Webhook] Payment ${paymentId} - ${body.action ?? 'notification'}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
