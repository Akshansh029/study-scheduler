// app/sync-user/page.tsx
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import ClientRedirect from "./client-redirect";

export default async function SyncUserPage() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress;
  if (!email) return notFound();

  try {
    await db.user.upsert({
      where: { emailAddress: email },
      update: {
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: new Date(),
      },
      create: {
        id: userId,
        emailAddress: email,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }

  return <ClientRedirect />;
}
