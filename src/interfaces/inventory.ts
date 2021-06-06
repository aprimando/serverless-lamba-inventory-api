export interface InventoryItem {
  id?: string,
  name: string,
  quantity: number,
  unitPrice: number,
  createdAt?: string
}

export interface InventoryItemSearch {
  id?: string,
  name?: string
}