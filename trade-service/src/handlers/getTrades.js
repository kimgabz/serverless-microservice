import AWS from 'aws-sdk';
import validator from '@middy/validator';
import createError from 'http-errors';

import commonMiddleware from '../middleware/common';
import tradesSchema from '../util/schema/getTradesSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getTrades(event, context) {
  let trades;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.TRADES_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  try {
    const result = await dynamodb.query(params).promise();
    trades = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(trades),
  };
}

export const handler = commonMiddleware(getTrades).use(
  validator({ inputSchema: tradesSchema, useDefaults: true })
);
