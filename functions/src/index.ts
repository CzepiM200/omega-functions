import * as auth from "firebase-functions/v1/auth"
import * as admin from "firebase-admin"
import * as homeFunctions from "./controllers/homeFunctions"
import * as orderFunctions from "./controllers/orderFunctions"

admin.initializeApp()

export const setUserRoleOnSignup = auth.user().onCreate(async (user) => {
  const userEmail = user.email ?? ""
  const displayName = user.displayName

  await admin.firestore().collection("users").doc(user.uid).set({
    email: userEmail,
    role: "user",
    name: displayName,
    image: "profile-images/kappa/KAPPA-1.webp",
    description: "",
    phoneNumber: "",
    categories: [],
    subordinates: [],
  })
})

export { homeFunctions, orderFunctions }
