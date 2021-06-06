
import { Context } from 'aws-lambda';
import {
  CREATED,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
  BAD_REQUEST
} from 'http-status-codes';

import { http } from '../helpers';
import { HttpResponse, InventoryItem } from '../interfaces';
import { inventory } from '../services';

async function createInventoryItem(event: any, context: Context): Promise<HttpResponse> {
  try {
    const {
      name,
      quantity,
      unitPrice
    } = event.body;

    if (!name || !quantity || !unitPrice) {
      return http.response(UNPROCESSABLE_ENTITY, {
        message: 'Please enter name, quantity and unit price.'
      });
    }

    if ((await inventory.getList({ name })).length) {
      return http.response(BAD_REQUEST, {
        message: `${name} already exists.`
      });
    }
  
    const item: InventoryItem = {
      name,
      quantity,
      unitPrice
    };
    const itemId = await inventory.create(item);
  
    return http.response(itemId ? CREATED : BAD_REQUEST, {
      message: itemId ? `Successfully created new inventory item: ${itemId}` :
        'Failed to create new inventory item.'
    });  
  } catch (error) {
    return http.response(INTERNAL_SERVER_ERROR, {
      message: 'Something went wrong.'
    });
  }
}

export const handler = http.commonMiddleware(createInventoryItem);
