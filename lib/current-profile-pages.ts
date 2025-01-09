import { NextApiRequest } from "next";

import { db } from "@/lib/db";
import { currentUser } from "./auth";

export const currentProfilePages = async (req: NextApiRequest) => {
  const user = await currentUser();
  const userId = user?.id;
  
  if (!userId) {
    return null;
  }

  const profile = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return profile;
};
