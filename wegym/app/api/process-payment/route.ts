import { authenticate, handleError } from '@/lib/api-utils';
import { paymentService } from '@/lib/services/payment.service';
import { paymentSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';

export const maxDuration = 15;

export async function POST(request: Request) {
  try {
    await authenticate();

    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Dados de pagamento incompletos', parsed.error.issues);
    }

    const result = await paymentService.process(parsed.data);

    return Response.json(result);
  } catch (error) {
    return handleError(error);
  }
}
