import { userService } from '@/lib/services/user.service';
import { handleError } from '@/lib/api-utils';
import { registerSchema } from '@/lib/validation';
import { ValidationError } from '@/lib/errors';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Dados inválidos', parsed.error.issues);
    }

    await userService.register(parsed.data);

    return Response.json({ message: 'Cadastro realizado com sucesso!' }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
