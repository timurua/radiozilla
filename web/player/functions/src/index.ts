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
import { AuthBlockingEvent } from "firebase-functions/identity";
import * as functions from "firebase-functions/v2";

admin.initializeApp();

export const createUserInFirestore = functions.identity.beforeUserCreated(async (event: AuthBlockingEvent) => {
  // Get user UID
  const user = event.data;
  const uid = user?.uid;
  if (!uid) {
    logger.error("No UID found for user.");
    return
  }
  
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
        await firestore.collection("users").doc(uid).set(userData);
        logger.info("User document created successfully.");
    } catch (error) {
        logger.error("Error creating user document:", error);
    }
});
