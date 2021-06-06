import { v4 as uuid } from 'uuid';
import moment from 'moment';

import { aws } from '../helpers';
import { InventoryItem, InventoryItemSearch } from '../interfaces';

const INVENTORY_TABLE_NAME = process.env
  .INVENTORY_TABLE_NAME as string; 

export const getList = async (itemSearch: InventoryItemSearch): Promise<InventoryItem[]> => {
  const dynamoDB = aws.getDynamoDBClient();
  let items: InventoryItem[] = [];

  try {
    const { Items } = await dynamoDB.scan({
      TableName: INVENTORY_TABLE_NAME,
      IndexName: 'nameAndCreatedAt',
      FilterExpression: 'contains(#name, :name)',
      ExpressionAttributeValues: {
        ':name': itemSearch.name,
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      },
    }).promise();

    items = Items as InventoryItem[];
  } catch (error) {
    console.error(error);
  }

  return items;
};

export const create = async (item: InventoryItem): Promise<string | undefined> => {
  const dynamoDB = aws.getDynamoDBClient();
  let itemId: string | undefined = undefined;

  try {
    const itemCreateId = uuid();
    const createdAt = moment().format('MM-DD-YYYY'); 

    await dynamoDB.put({
      TableName: INVENTORY_TABLE_NAME,
      Item: {
        id: itemCreateId,
        createdAt,
        ...item
      }
    }).promise();

    itemId = itemCreateId;
  } catch (error) {
    console.error(error);
  }

  return itemId;
};

export const get = async (itemSearch: InventoryItemSearch): Promise<InventoryItem | undefined> => {
  const dynamoDB = aws.getDynamoDBClient();
  let item;

  try {
    const { Item } = await dynamoDB.get({
      TableName: INVENTORY_TABLE_NAME,
      Key: { id: itemSearch.id },
    }).promise();

    item = Item;
  } catch (error) {
    console.error(error);
  }

  return item as InventoryItem;
};

export const update = async (itemId: string, item: InventoryItem): Promise<string | undefined> => {
  const dynamoDB = aws.getDynamoDBClient();
  let itemIdUpdated: string | undefined = undefined;

  try {
    const { name, quantity, unitPrice } = item; 

    await dynamoDB.update({
      TableName: INVENTORY_TABLE_NAME,
      Key: { id: itemId },
      UpdateExpression: 'set #name = :name,' +
        'quantity = :quantity,' +
        'unitPrice = :unitPrice',
      ExpressionAttributeValues: {
        ':name': name,
        ':quantity': quantity,
        ':unitPrice': unitPrice
      },
      ExpressionAttributeNames: {
        '#name': 'name',
      }
    }).promise();

    itemIdUpdated = itemId;
  } catch (error) {
    console.error(error);
  }

  return itemIdUpdated;
};

export const deleteItem = async (itemId: string): Promise<string | undefined> => {
  const dynamoDB = aws.getDynamoDBClient();
  let itemIdDeleted: string | undefined = undefined;

  try {
    await dynamoDB.delete({
      TableName: INVENTORY_TABLE_NAME,
      Key: { id: itemId }
    }).promise();

    itemIdDeleted = itemId;
  } catch (error) {
    console.error(error);
  }

  return itemIdDeleted;
};
