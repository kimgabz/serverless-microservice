import middy from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';
import cors from '@middy/http-cors';

import { getTradeById } from './getTrade';
import { uploadImageToS3 } from '../util/uploadImageToS3';
import { setTradeImageUrl } from '../util/setTradeImageUrl';
import uploadImageSchema from '../util/schema/uploadImageSchema';

export async function uploadTradeImage(event) {
  const { id } = event.pathParameters;
  const trade = await getTradeById(id);
  const { email } = event.requestContext.authorizer;

  // Validate trade ownership
  if (trade.seller !== email) {
    throw new createError.Forbidden('You are not the seller of this item');
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  let updatedTrade;
  try {
    const imageUrl = await uploadImageToS3(trade.id + '.jpg', buffer);
    // console.log(imageUrl);
    updatedTrade = await setTradeImageUrl(trade.id, imageUrl);
  } catch (error) {
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedTrade),
  };
}

export const handler = middy(uploadTradeImage)
  .use(httpErrorHandler())
  .use(validator({ inputSchema: uploadImageSchema }))
  .use(cors());
