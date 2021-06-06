import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpCors from '@middy/http-cors';

export const response = (status: number, data: object) => {
  return {
    statusCode: status,
    body: JSON.stringify(data)
  };
};

// @ts-ignore
export const commonMiddleware = handler => middy(handler)
  .use([
    httpJsonBodyParser(),
    httpEventNormalizer(),
    httpCors()
  ]);
