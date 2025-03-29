import { GlobalCollections, OrderCollectionIds } from "../consts/collection"
import * as admin from "firebase-admin"

export const getSortedListByOrderList = async <T extends { id: string }>(
  orderItemId: OrderCollectionIds,
  collection?: Array<T>,
): Promise<Array<T>> => {
  const collectionReference = admin.firestore().collection(GlobalCollections.COLLECTIONS_ORDER)
  const orderItemData = await collectionReference.doc(orderItemId).get()

  const order = orderItemData.data()?.order as Array<string>

  if (!collection) {
    return [] as Array<T>
  }

  if (!order) {
    return collection
  }

  return order.reduce((acc, sectionId) => {
    const foundItem = collection.find((collectionItem) => collectionItem.id === sectionId)

    if (foundItem) {
      return [...acc, foundItem]
    }

    return acc
  }, [] as Array<T>)
}
