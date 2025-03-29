import * as admin from "firebase-admin"
import { GlobalCollections, OrderCollections } from "../consts/collection"

export const addNewIdToOrderItem = async (orderItemName: OrderCollections, newId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemName)
  const orderItem = await orderItemReference.get()

  const orderData = orderItem.data() as { order: Array<string> }
  const newOrder = [...(orderData?.order ?? []), newId]

  await orderItemReference.set({ order: newOrder })

  return
}

export const deleteIdToOrderItem = async (orderItemName: OrderCollections, deleteId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemName)
  const orderItem = await orderItemReference.get()

  const orderData = orderItem.data() as { order: Array<string> }
  const newOrder = (orderData?.order ?? []).filter(id => id !== deleteId)

  await orderItemReference.set({ order: newOrder })

  return
}