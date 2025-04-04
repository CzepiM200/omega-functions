import * as https from "firebase-functions/v2/https"
import { authMiddleware } from "../utils/authMiddleware"
import * as admin from "firebase-admin"
import { addNewIdToOrderItem, deleteIdToOrderItem } from "../utils/orderModifiers"
import { GlobalCollections, OrderCollectionIds } from "../consts/collection"
import { Roles } from "../consts/roles"
import { setGlobalOptions } from "firebase-functions/v2"
import { getSortedListByOrderList } from "../utils/orderList"

setGlobalOptions({ region: "europe-central2" })

export const getProductSections = https.onRequest(authMiddleware(async (req, res) => {
  try {
    const collectionSnapshot = await admin.firestore().collection(GlobalCollections.PRODUCT_SECTIONS).get()
    const productSectionsData = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const productSectionsSorted = await getSortedListByOrderList(OrderCollectionIds.PRODUCT_PAGE, productSectionsData)

    res.status(200).send({ content: productSectionsSorted })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
}))

export const getProductSectionDetails = https.onRequest(authMiddleware(async (req, res) => {
  try {
    const productSnapshot = admin.firestore().collection(GlobalCollections.PRODUCT_SECTIONS).doc(req.body.id)
    const product = await productSnapshot.get()

    if (!product) {
      res.status(404).send({ message: "Product not found" })
    }

    res.status(200).send({ id: product.id, ...product.data() })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
}))

export const addProductSection = https.onRequest(authMiddleware(async (req, res) => {
  try {
    const newProductSection = await admin.firestore().collection(GlobalCollections.PRODUCT_SECTIONS).add(req.body)

    await addNewIdToOrderItem(OrderCollectionIds.PRODUCT_PAGE, newProductSection.id)

    res.status(201).send({ id: newProductSection.id })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
}, [Roles.ADMIN]))

export const editProductSection = https.onRequest(authMiddleware(async (req, res) => {
  const { id, ...data } = req.body

  try {
    await admin.firestore().collection(GlobalCollections.PRODUCT_SECTIONS).doc(id).set(data)

    res.status(200).send({ id })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
}, [Roles.ADMIN]))

export const deleteProductSection = https.onRequest(authMiddleware(async (req, res) => {
  try {
    await admin.firestore().collection(GlobalCollections.PRODUCT_SECTIONS).doc(req.body.id).delete()
    await deleteIdToOrderItem(OrderCollectionIds.PRODUCT_PAGE, req.body.id)

    res.status(200).send({ message: "SUCCESS" })
  } catch (error) {
    res.status(500).send({ message: JSON.stringify(error) })
  }
}, [Roles.ADMIN]))
