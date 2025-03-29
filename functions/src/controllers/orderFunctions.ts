import * as https from "firebase-functions/v2/https"
import { checkAuthenticationAndAuthorization } from "../utils/authMiddleware"
import { moveIdDownInOrder, moveIdUpInOrder } from "../utils/orderModifiers"
import { OrderCollectionIds } from "../consts/collection"
import { Roles } from "../consts/roles"
import { setGlobalOptions } from "firebase-functions/v2"

setGlobalOptions({ region: "europe-central2" })

export const moveItemInOrder = https.onRequest(async (req, res) => {
  const { isAuthenticated, isAuthorized } = await checkAuthenticationAndAuthorization(req, res, [Roles.ADMIN])

  if (!isAuthenticated || !isAuthorized) {
    return
  }

  const body = req.body as {
    direction: "up" | "down"
    orderId: OrderCollectionIds
    itemId: string
  }

  try {
    if (body.direction === "up") {
      await moveIdUpInOrder(body.orderId, body.itemId)
    } else {
      await moveIdDownInOrder(body.orderId, body.itemId)
    }


    res.status(200).send({ message: "SUCCESS" })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})