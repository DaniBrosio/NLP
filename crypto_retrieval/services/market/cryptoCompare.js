import dotenv from 'dotenv';
import rp from 'request-promise';
dotenv.config();

const CRYPTOCOMPARE_API_KEY = process.env['CRYPTOCOMPARE_API_KEY'];

export async function getCryptoPrice(cryptoId) {
  const requestOptions = {
    method: 'GET',
    uri: `https://min-api.cryptocompare.com/data/price?fsym=${cryptoId}&tsyms=USD`,
    headers: {
      Apikey: CRYPTOCOMPARE_API_KEY
    },
    json: true,
    gzip: true
  };

  return rp(requestOptions);

}
