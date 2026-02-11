import { cookies } from "next/headers";

type SessionUser = {
  id: number;
  name: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  if (!session) return null;

  try {
    return JSON.parse(session.value) as SessionUser;
  } catch {
    return null;
  }
}
