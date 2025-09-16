import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (loggedUser) {
      return loggedUser;
    }

    // If this is the first user in the system, make them ADMIN to bootstrap access
    const usersCount = await db.user.count();

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        role: usersCount === 0 ? "ADMIN" : undefined,
      },
    });

    return newUser;
  } catch (err) {
    console.log(err);
  }
};
