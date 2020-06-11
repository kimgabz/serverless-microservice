import AWS from 'aws-sdk';

import createError from 'http-errors';
import validator from '@middy/validator';

import commonMiddleware from '../middleware/common';

import { getTradeById } from './getTrade';
import placeBidSchema from '../util/schema/placeBidSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

  const trade = await getTradeById(id);
  if (email === trade.seller) {
    throw new createError.Forbidden(`You cannot bid on your own`);
  }

  if (email === trade.highestBid.bidder) {
    throw new createError.Forbidden(`You cannot bid twice`);
  }

  if (trade.status !== 'OPEN') {
    throw new createError.Forbidden(`You cannot bid on closed trade`);
  }

  if (amount <= trade.highestBid.amount) {
    throw new createError.Forbidden(
      `Your bid must be higher than ${trade.highestBid.amount}`
    );
  }

  const params = {
    TableName: process.env.TRADES_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': email,
    },
    ReturnValues: 'ALL_NEW',
  };

  let updatedTrade;
  try {
    const result = await dynamodb.update(params).promise();
    updatedTrade = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedTrade),
  };
}

export const handler = commonMiddleware(placeBid).use(
  validator({ inputSchema: placeBidSchema })
);
