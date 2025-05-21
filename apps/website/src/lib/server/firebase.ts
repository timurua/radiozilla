// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

import { cookies } from "next/headers";
import { initializeApp, initializeServerApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { db } from "../db/drizzle";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { UserDTO } from "../db/interfaces";
import { firebaseConfig } from "../firebase";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
export async function getAuthenticatedAppForUser(): Promise<{
    firebaseServerApp: ReturnType<typeof initializeServerApp>;
    currentUser: import("firebase/auth").User | null;
}> {
    const authIdToken = (await cookies()).get("__session")?.value;

    // Firebase Server App is a new feature in the JS SDK that allows you to
    // instantiate the SDK with credentials retrieved from the client & has
    // other affordances for use in server environments.
    const firebaseServerApp = initializeServerApp(
        // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
        initializeApp(firebaseConfig),
        {
            authIdToken,
        }
    );

    const auth = getAuth(firebaseServerApp);
    await auth.authStateReady();

    return { firebaseServerApp, currentUser: auth.currentUser };
}

export async function getUser(): Promise<UserDTO | null> {
    const { currentUser } = await getAuthenticatedAppForUser();
    if (!currentUser) {
        return null;
    }
    const dbUsers = await db.select({
        userId: users.id,
        firebaseUserId: users.firebaseUserId,
        name: users.name,
        description: users.description,
        email: users.email,
        imageUrl: users.imageUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        is_enabled: users.is_enabled
    }).from(users).where(eq(users.firebaseUserId, currentUser?.uid)).limit(1);

    if (dbUsers.length > 0) {
        return dbUsers[0];
    }
    return null;
}