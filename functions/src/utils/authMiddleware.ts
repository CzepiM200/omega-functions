import * as https from "firebase-functions/v2/https"
import * as admin from "firebase-admin"
import * as express from "express"
import { GlobalCollections } from "../consts/collection"
import { Roles } from "../consts/roles"

type CloudFunctionRequest = https.Request
type CloudFunctionResponse = express.Response
type UserData = admin.firestore.DocumentData

export const authMiddleware =
  (handler: (req: CloudFunctionRequest, res: CloudFunctionResponse, user: UserData) => Promise<void>, allowedRoles?: Array<Roles>) =>
    async (req: CloudFunctionRequest, res: CloudFunctionResponse): Promise<void> => {
      const token = req.headers.authorization

      if (!token || !token.startsWith("Bearer ")) {
        res.status(401).send({ message: "Unauthenticated" })

        return
      }

      const idToken = token.split("Bearer ")[1]

      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        const uid = decodedToken.uid

        const userReference = await admin.firestore().collection(GlobalCollections.USERS).doc(uid).get()
        const userData = userReference.data()

        if (allowedRoles && !allowedRoles.includes(userData?.role)) {
          res.status(403).send({ message: "Unauthorized" })

          return
        }

        if (!userData) {
          res.status(404).send({ message: "User not found" })

          return
        }

        await handler(req, res, userData)
      } catch (error) {
        res.status(401).send({ message: "Unauthenticated" })

        return
      }

      return
    }
    