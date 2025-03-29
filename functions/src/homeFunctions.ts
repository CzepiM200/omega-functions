import * as https from "firebase-functions/v2/https"
import { setGlobalOptions } from "firebase-functions"
import { checkAuthenticationAndAuthorization } from "./utils/authMiddleware"
import * as admin from "firebase-admin"
import { addNewIdToOrderItem, deleteIdToOrderItem } from "./utils/orderModifiers"
import { GlobalCollections, OrderCollections } from "./consts/collection"
import { Roles } from "./consts/roles"

setGlobalOptions({ region: "europe-central2" })

export const addHomeSection = https.onRequest(async (req, res) => {
  const { isAuthenticated, isAuthorized } = await checkAuthenticationAndAuthorization(req, res, [Roles.ADMIN])

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

    res.status(201).send({ id: newHomeSection.id })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})

export const editHomeSection = https.onRequest(async (req, res) => {
  const { isAuthenticated, isAuthorized } = await checkAuthenticationAndAuthorization(req, res, [Roles.ADMIN])

  if (!isAuthenticated || !isAuthorized) {
    return
  }

  const body = req.body as {
    id: string
    type: string
    data: object
  }

  try {
    await admin.firestore().collection(GlobalCollections.HOME_SECTION).doc(body.id).set({
      type: body.type,
      ...body.data,
    })

    res.status(200).send({ id: body.id })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})

export const deleteHomeSection = https.onRequest(async (req, res) => {
  const { isAuthenticated, isAuthorized } = await checkAuthenticationAndAuthorization(req, res, [Roles.ADMIN])

  if (!isAuthenticated || !isAuthorized) {
    return
  }

  const body = req.body as {
    id: string
  }

  try {
    await admin.firestore().collection(GlobalCollections.HOME_SECTION).doc(body.id).delete()
    await deleteIdToOrderItem(OrderCollections.HOME_PAGE, body.id)

    res.status(200).send({ message: "SUCCESS" })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})
