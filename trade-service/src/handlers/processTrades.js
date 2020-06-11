import createError from 'http-errors';

import { closeTrade } from '../util/closeTrade';
import { getEndedTrades } from '../util/getEndedTrades';

async function processTrades(event, context) {
  try {
    const tradesToClose = await getEndedTrades();
    const closePromises = tradesToClose.map((trade) => closeTrade(trade));
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processTrades;
