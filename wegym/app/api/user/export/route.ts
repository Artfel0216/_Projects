import { NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { authenticate, handleError } from '@/lib/api-utils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await authenticate();
    const data = await userService.exportData(session.user.id);
    return NextResponse.json(data);
  } catch (error) {
    return handleError(error);
  }
}
