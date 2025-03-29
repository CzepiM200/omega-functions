import * as https from "firebase-functions/v2/https"
import * as admin from "firebase-admin"
import { GlobalCollections } from "../consts/collection"

type CloudEndpointType = typeof https.onRequest
type CloudEndpointArgsType = Parameters<Parameters<CloudEndpointType>[0]>
// type HandleType = (typeof https.onRequest)
//
// export const authMiddleware =
//     (handler: HandleType, {authenticatedRoute = true} = {}) =>
//         (req: CloudEndpointArgsType[0], res: CloudEndpointArgsType[1]) => {
//             if (authenticatedRoute) {
//                 const isAuthorized = isAuthenticated(req)
//
//                 if (!isAuthorized) {
//                     res.status(401).send({message: 'Unauthorized'})
//                     return
//                 }
//             }
//             // return cors(req, res, () => {
//             return handler(req, res)
//             // })
//         }

const notAuthenticatedResponse = { isAuthorized: false, isAuthenticated: false, user: undefined }
const notAuthorizedResponse = { isAuthorized: true, isAuthenticated: false, user: undefined }

export const checkAuthenticationAndAuthorization = async (req: CloudEndpointArgsType[0], res: CloudEndpointArgsType[1], allowedRoles?: Array<string>) => {
  const token = req.headers.authorization

  if (!token || !token.startsWith("Bearer ")) {
    res.status(401).send({ message: "Unauthenticated" })

    return notAuthenticatedResponse
  }

  const idToken = token.split("Bearer ")[1]

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid

    const user = await admin.firestore().collection(GlobalCollections.USERS).doc(uid).get()

    if (allowedRoles) {
      if (!allowedRoles.includes(user.data()?.role)) {
        res.status(403).send({ message: "Unauthorized" })

        return notAuthorizedResponse
      }
    }

    return { isAuthorized: true, isAuthenticated: true, user }
  } catch (error) {
    res.status(401).send({ message: "Unauthenticated" })

    return notAuthenticatedResponse
  }
}
