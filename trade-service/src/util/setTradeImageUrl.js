import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function setTradeImageUrl(id, imageUrl) {
  const params = {
    TableName: process.env.TRADES_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set imageUrl = :imageUrl',
    ExpressionAttributeValues: {
      ':imageUrl': imageUrl,
    },
    ReturnValues: 'ALL_NEW',
  };

  const result = await dynamodb.update(params).promise();
  return result.Attributes;
}
