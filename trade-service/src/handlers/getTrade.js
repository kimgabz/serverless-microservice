import AWS from 'aws-sdk';

import createError from 'http-errors';

import commonMiddleware from '../middleware/common';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getTradeById(id) {
  let trade;
  try {
    const result = await dynamodb
      .get({
        TableName: process.env.TRADES_TABLE_NAME,
        Key: { id: id },
      })
      .promise();
    trade = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!trade) {
    throw new createError.NotFound(`Trade with ID "${id}" not found`);
  }

  return trade;
}

async function getTrade(event, context) {
  const { id } = event.pathParameters;
  const trade = await getTradeById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(trade),
  };
}

export const handler = commonMiddleware(getTrade);
//.use(... other functions);
