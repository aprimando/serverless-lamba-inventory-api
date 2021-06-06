
import { Context } from 'aws-lambda';
import {
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  BAD_REQUEST
} from 'http-status-codes';

import { http } from '../helpers';
import { HttpResponse } from '../interfaces';
import { inventory } from '../services';

async function deleteInventoryItem(event: any, context: Context): Promise<HttpResponse> {
  try {
    const { id } = event.pathParameters;

    if (!await inventory.get({ id })) {
      return http.response(NOT_FOUND, {
        message: `Item not found: ${id}`
      });
    }
  
    const itemId = await inventory.deleteItem(id);
  
    return http.response(itemId ? OK : BAD_REQUEST, {
      message: itemId ? `Successfully deleted an inventory item: ${itemId}` :
        'Failed to delete an inventory item.'
    });  
  } catch (error) {
    return http.response(INTERNAL_SERVER_ERROR, {
      message: 'Something went wrong.'
    });
  }
}

export const handler = http.commonMiddleware(deleteInventoryItem);
