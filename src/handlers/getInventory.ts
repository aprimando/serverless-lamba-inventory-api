
import { Context } from 'aws-lambda';
import {
  OK,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR
} from 'http-status-codes';

import { HttpResponse } from '../interfaces';
import { http } from '../helpers';
import { inventory } from '../services';

async function getInventory(event: any, context: Context): Promise<HttpResponse> {
  try {
    const name = event.queryStringParameters.name || ''; 

    const items = await inventory.getList({ name });

    if (items.length === 0) {
      return http.response(NOT_FOUND, {
        message: 'Inventory item not found.'
      });
    }

    return http.response(OK, {
      items
    });
  } catch (error)   {
    return http.response(INTERNAL_SERVER_ERROR, {
      message: 'Something went wrong.'
    });
  }
}

export const handler = http.commonMiddleware(getInventory);
