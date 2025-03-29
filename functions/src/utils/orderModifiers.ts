import * as admin from "firebase-admin"
import { GlobalCollections, OrderCollections } from "../consts/collection"

export const addNewIdToOrderItem = async (orderItemName: OrderCollections, newId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemName)
  const orderItem = await orderItemReference.get()

  const orderData = orderItem.data()

  await orderItemReference.set({ order: [...(orderData?.order ?? []), newId] })

  return
}