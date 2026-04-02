import { cookies } from "next/headers";

export interface SessionUser {
  id: string | number;
  name: string;
  email?: string;
  image?: string | null;
}

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "user_session";

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);

    if (!session?.value) {
      return null;
    }

    const decodedPayload = Buffer.from(session.value, "base64").toString("utf-8");
    const parsed = JSON.parse(decodedPayload);

    if (!parsed || typeof parsed !== "object" || !parsed.id) {
      return null;
    }

    return {
      id: parsed.id,
      name: parsed.name ?? "User",
      email: parsed.email,
      image: parsed.image,
    } as SessionUser;
  } catch (error) {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}