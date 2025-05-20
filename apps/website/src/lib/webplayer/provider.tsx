'use client';

import { createContext, ReactNode, useEffect, useState } from "react";
import { useAuth } from "../auth/provider";
import { RZUserData } from "@/components/webplayer/data/model";
import { upsertFrontendUser } from "@/lib/db/client";
import logger from "@/components/webplayer/utils/logger";

export const FrontEndUserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [frontEndUser, setFrontEndUser] = useState<RZUserData | null>(null);

  useEffect(() => {
    if (user?.id) {
      upsertFrontendUser(new RZUserData(
        user.id,
        new Date(),
        new Date(),
        [],
        [],
        [],
        [],
        null
      ))
        .then((userData) => setFrontEndUser(userData))
        .catch((err) => logger.error(err));
    }
  }, [user]);

  return (
    <FrontEndUserContext.Provider value={{ frontEndUser, setFrontEndUser }}>
      {children}
    </FrontEndUserContext.Provider>
  );
};

export const FrontEndUserContext = createContext<{
  frontEndUser: RZUserData | null;
  setFrontEndUser: (userData: RZUserData | null) => void;
} | null>(null);
