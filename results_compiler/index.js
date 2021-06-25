
import dotenv from 'dotenv';
import xl from 'excel4node';
import MongodbManager from './services/db/mongodb.js';
dotenv.config();

const dbManager = new MongodbManager();
const wb = new xl.Workbook();
const style = wb.createStyle({
  font: {
    // color: '#FF0800',
    size: 12,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
});

const ws = wb.addWorksheet('Sheet 1');

(async () => {
  const cursor = await dbManager.getAvailableResults();
  const results = await cursor.toArray();

  results.map(async ({ _id: id, timeoutPrice, batchTimePrice, docId, state, ...rest }, resultIndex) => {
    const shallowObject = { timeoutPriceUSD: timeoutPrice.USD, batchTimePriceUSD: batchTimePrice.USD, ...rest };
    const keys = Object.keys(shallowObject);
    console.log(shallowObject);
    console.log(keys);
    keys.map((key, index) => {
      let xlCursor = ws.cell(1, index + 1);
      xlCursor.string(key || '')
        .style(style);
      xlCursor = ws.cell(2 + resultIndex, index + 1);
      if (!shallowObject[key]) return;
      if (typeof shallowObject[key] === 'number') xlCursor.number(shallowObject[key] || 0).style(style);
      else if (typeof shallowObject[key] === 'string') xlCursor.string(shallowObject[key] || '').style(style);

    });
    wb.write('output/results.xlsx');

    console.log("byee")
  });
})();

