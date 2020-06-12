import AWS from 'aws-sdk';

const ses = new AWS.SES({ reqion: 'eu-west-1' });

async function sendMail(event, context) {
  // console.log(event);
  // return event;

  // return {
  //   statusCode: 200,
  //   body: JSON.stringify({ message: 'Hello from sendMail' }),
  // };
  const record = event.Records[0];
  // console.log('record processing', record);
  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: 'khemgabz@gmail.com',
    Destination: {
      ToAddresses: recipient,
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
