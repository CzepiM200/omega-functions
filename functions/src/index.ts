import * as auth from "firebase-functions/v1/auth";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRoleOnSignup = auth.user().onCreate(async (user) => {
  const userEmail = user.email ?? "";

  await admin.firestore().collection("users").doc(user.uid).set({
    email: userEmail,
    role: "user",
    name: userEmail,
    image: 'profile-images/KAPPA-1.webp',
  });
});
