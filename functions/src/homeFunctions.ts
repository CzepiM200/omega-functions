import * as https from "firebase-functions/v2/https"
import * as logger from "firebase-functions/logger"
import { setGlobalOptions } from "firebase-functions"
import { checkAuthenticationAndAuthorization } from "./utils/authMiddleware"
import * as admin from "firebase-admin"
import { addNewIdToOrderItem } from "./utils/orderModifiers"
import { GlobalCollections, OrderCollections } from "./consts/collection"

setGlobalOptions({ region: "europe-central2" })

export const addHomeSection = https.onRequest(async (req, res) => {
  const { isAuthenticated, isAuthorized } = await checkAuthenticationAndAuthorization(req, res, ["admin"])

  if (!isAuthenticated || !isAuthorized) {
    return
  }

  const body = req.body as {
    type: string
    data: object
  }

  try {
    const newHomeSection = await admin.firestore().collection(GlobalCollections.HOME_SECTION).add({
      type: body.type,
      ...body.data,
    })

    await addNewIdToOrderItem(OrderCollections.HOME_PAGE, newHomeSection.id)

    res.send({ id: newHomeSection.id })
  } catch (error) {
    logger.error(JSON.stringify(error))
    res.status(500).send({ message: JSON.stringify(error) })
  }
  return
})
