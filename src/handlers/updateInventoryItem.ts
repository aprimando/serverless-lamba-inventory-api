
import { Context } from 'aws-lambda';
import {
  OK,
  INTERNAL_SERVER_ERROR,
  UNPROCESSABLE_ENTITY,
  BAD_REQUEST,
  NOT_FOUND
} from 'http-status-codes';

import { http } from '../helpers';
import { HttpResponse, InventoryItem } from '../interfaces';
import { inventory } from '../services';

async function updateInventoryItem(event: any, context: Context): Promise<HttpResponse> {
  try {
    const { id } = event.pathParameters;
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

    if (!await inventory.get({ id })) {
      return http.response(NOT_FOUND, {
        message: `Item not found: ${name}`
      });
    }
  
    const item: InventoryItem = {
      name,
      quantity,
      unitPrice
    };
    const itemId = await inventory.update(id, item);
  
    return http.response(itemId ? OK : BAD_REQUEST, {
      message: itemId ? `Successfully updated an inventory item: ${itemId}` :
        'Failed to update an inventory item.'
    });  
  } catch (error) {
    return http.response(INTERNAL_SERVER_ERROR, {
      message: 'Something went wrong.'
    });
  }
}

export const handler = http.commonMiddleware(updateInventoryItem);
