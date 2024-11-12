/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// import {onRequest} from "firebase-functions/v2/https";
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

admin.initializeApp();

// Triggers when a new anonymous user is created
export const onCreate = functions.auth.user().onCreate(
    async (user: admin.auth.UserRecord): Promise<void | null> => {
        // Set up a Firestore reference
        const firestore = admin.firestore();

        // Define user data to store in Firestore
        const userData = {
            name: user?.displayName || null,
            email: user?.email || null,
            imageURL: user?.photoURL || null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            subscribedChannelIds: [],
            likedAudioIds: [],
            listenedAudioIds: [],
        };

        // Create a document in the "users" collection with the UID
        try {
            await firestore.collection("users").doc(user.uid).set(userData);
            logger.info("User document created successfully.");
        } catch (error) {
            logger.error("Error creating user document:", error);
        }
    }
);

// Triggers when an anonymous user is deleted
export const onAnonymousUserDeleted = functions.auth.user().onDelete(
    async (user: admin.auth.UserRecord): Promise<void | null> => {

        const uid: string = user.uid;

        // Example: Clean up user data
        await admin.firestore()
            .collection('users')
            .doc(uid)
            .delete();

    }

);

// Triggers when an anonymous user is converted to a permanent account
// export const onAnonymousUpgrade = functions.auth.user().beforeCreate(
//     async (user: AuthUserRecord, context: AuthEventContext): Promise<void> => {
//         // Check if this is a conversion from anonymous
//         if (user.providerData && user.providerData.length > 0) {
//             const anonymousUid: string = user.metadata.creationTime;

//             try {
//                 const docSnapshot = await admin.firestore()
//                     .collection('users')
//                     .doc(anonymousUid)
//                     .get();

//                 if (docSnapshot.exists) {
//                     const existingData = docSnapshot.data() as UserDocument;

//                     const updatedData: UserDocument = {
//                         ...existingData,
//                         isAnonymous: false,
//                         convertedAt: admin.firestore.Timestamp.now(),
//                     };

//                     await admin.firestore()
//                         .collection('users')
//                         .doc(user.uid)
//                         .set(updatedData);
//                 }
//             } catch (error) {
//                 console.error('Error during anonymous user upgrade:', error);
//                 return Promise.reject(error);
//             }
//         }
//         return Promise.resolve();
//     }
// );
