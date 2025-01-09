import { db } from "@/lib/db";
import { currentUser } from "./auth";

export const initialProfile = async () => {
  const user = await currentUser();

  const profile = await db.user.findUnique({
    where: {
      id: user?.id,
    },
  });

  if (profile) {
    return profile;
  }

  const newProfile = await db.user.create({
    data: {
      id: user?.id,
      name: `${user?.name}`,
      image: user?.image,
      email: user?.email,
    },
  });

  return newProfile;
};
