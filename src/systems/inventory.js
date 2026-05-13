import { items } from '../data/items.js'

export function createInventory(initialEntries = []) {
  const entries = new Map()

  for (const entry of initialEntries) {
    addItem(entry.itemId ?? entry.id, entry.quantity ?? 1)
  }

  function addItem(itemId, quantity = 1) {
    if (!items[itemId]) {
      throw new Error(`Unknown item id: ${itemId}`)
    }

    const existingQuantity = entries.get(itemId) ?? 0
    entries.set(itemId, existingQuantity + quantity)

    return getItemStack(itemId)
  }

  function hasItem(itemId, quantity = 1) {
    return (entries.get(itemId) ?? 0) >= quantity
  }

  function getItemStack(itemId) {
    const item = items[itemId]

    if (!item) {
      return null
    }

    return {
      item,
      quantity: entries.get(itemId) ?? 0,
    }
  }

  function listItems() {
    return [...entries.entries()].map(([itemId, quantity]) => ({
      item: items[itemId],
      quantity,
    }))
  }

  function getAll() {
    return [...entries.entries()].map(([itemId, quantity]) => ({
      itemId,
      quantity,
    }))
  }

  return {
    addItem,
    getAll,
    hasItem,
    listItems,
  }
}
