import { prisma } from "./db";

export async function validateBearerToken(
  authHeader: string | null
): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const record = await prisma.oAuthToken.findUnique({
    where: { accessToken: token },
  });
  if (!record) return false;
  if (record.expiresAt < new Date()) {
    await prisma.oAuthToken.delete({ where: { id: record.id } });
    return false;
  }
  return true;
}
