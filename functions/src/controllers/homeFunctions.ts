import * as https from "firebase-functions/v2/https"
import { checkAuthenticationAndAuthorization } from "../utils/authMiddleware"
import * as admin from "firebase-admin"
import { addNewIdToOrderItem, deleteIdToOrderItem } from "../utils/orderModifiers"
import { GlobalCollections, OrderCollectionIds } from "../consts/collection"
import { Roles } from "../consts/roles"
import { setGlobalOptions } from "firebase-functions/v2"
import { getSortedListByOrderList } from "../utils/orderList"

setGlobalOptions({ region: "europe-central2" })

export const getHomeSections = https.onRequest(async (req, res) => {
  const {
    isAuthenticated,
    isAuthorized,
  } = await checkAuthenticationAndAuthorization(req, res, [Roles.ADMIN, Roles.MODERATOR, Roles.USER])

  if (!isAuthenticated || !isAuthorized) {
    return
  }

  try {
    const homeSectionsSnapshot = await admin.firestore().collection(GlobalCollections.HOME_SECTION).get()
    const homeSectionsData = homeSectionsSnapshot.docs.map(doc => {
      const { type, ...data } = doc.data()

      return ({ id: doc.id, type, data })
    })
    const hoseSectionsSorted = await getSortedListByOrderList(OrderCollectionIds.HOME_PAGE, homeSectionsData)

    res.status(200).send({ content: hoseSectionsSorted })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})

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

    await addNewIdToOrderItem(OrderCollectionIds.HOME_PAGE, newHomeSection.id)

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
    await deleteIdToOrderItem(OrderCollectionIds.HOME_PAGE, body.id)

    res.status(200).send({ message: "SUCCESS" })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
})
