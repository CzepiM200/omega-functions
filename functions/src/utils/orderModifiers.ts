import * as admin from "firebase-admin"
import { GlobalCollections, OrderCollectionIds } from "../consts/collection"

export const addNewIdToOrderItem = async (orderItemId: OrderCollectionIds, newId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemId)
  const orderItem = await orderItemReference.get()

  const orderData = orderItem.data() as { order: Array<string> }
  const newOrder = [...(orderData?.order ?? []), newId]

  await orderItemReference.set({ order: newOrder })

  return
}

export const deleteIdToOrderItem = async (orderItemId: OrderCollectionIds, deleteId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemId)
  const orderItem = await orderItemReference.get()

  const orderData = orderItem.data() as { order: Array<string> }
  const newOrder = (orderData?.order ?? []).filter(id => id !== deleteId)

  await orderItemReference.set({ order: newOrder })

  return
}

export const moveIdUpInOrder = async (orderItemId: OrderCollectionIds, itemId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemId)
  const orderItem = await orderItemReference.get()

  const { order } = orderItem.data() as { order: Array<string> }

  const newOrder = moveIdUp(itemId, order)

  await orderItemReference.set({ order: newOrder })

  return
}

const moveIdUp = (id: string, order?: Array<string>) => {
  if (order) {
    const itemIndex = order.indexOf(id)

    if (itemIndex > 0) {
      return order.map((itemId, idx) => {
        if (idx === itemIndex) {
          return order.at(itemIndex - 1) as string
        }

        if (idx === itemIndex - 1) {
          return order.at(itemIndex) as string
        }

        return itemId
      })
    }
  }

  return order
}

export const moveIdDownInOrder = async (orderItemId: OrderCollectionIds, itemId: string) => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemReference = collectionReference.doc(orderItemId)
  const orderItem = await orderItemReference.get()

  const { order } = orderItem.data() as { order: Array<string> }

  const newOrder = moveIdDown(itemId, order)

  await orderItemReference.set({ order: newOrder })

  return
}

const moveIdDown = (id: string, order?: Array<string>) => {
  if (order) {
    const itemIndex = order.indexOf(id)

    if (itemIndex < order.length - 1) {
      return order.map((itemId, idx) => {
        if (idx === itemIndex) {
          return order.at(itemIndex + 1) as string
        }

        if (idx === itemIndex + 1) {
          return order.at(itemIndex) as string
        }

        return itemId
      })
    }
  }

  return order
}
