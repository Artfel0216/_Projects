import { MercadoPagoConfig, Payment } from 'mercadopago';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const mpToken = process.env.MP_ACCESS_TOKEN;
if (!mpToken) {
  throw new Error("MP_ACCESS_TOKEN não definido no .env");
}

const client = new MercadoPagoConfig({
  accessToken: mpToken,
  options: { timeout: 5000 }
});

const paymentInstance = new Payment(client);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const body = await request.json();
    const { transaction_amount, token, installments, payment_method_id, issuer_id, payer } = body;

    if (!transaction_amount || !token || !installments || !payment_method_id || !payer?.email) {
      return NextResponse.json({ error: 'Dados de pagamento incompletos' }, { status: 422 });
    }

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

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro no pagamento';
    console.error("Erro no pagamento:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}