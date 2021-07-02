
import dotenv from 'dotenv';
import xl from 'excel4node';
import MongodbManager from './services/db/mongodb.js';
import { readFile } from 'fs/promises';

dotenv.config();

const dbManager = new MongodbManager();
const wb = new xl.Workbook();

const headerStyle = wb.createStyle({
  font: {
    size: 12,
    bold: true
  },
});

const defaultStyle = wb.createStyle({
  font: {
    size: 12
  }
});

const numberStyle = defaultStyle;

const moneyStyle = wb.createStyle({
  font: {
    size: 12
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
});

const percentageStyle = wb.createStyle({
  font: {
    size: 12,
    color: '#FF0808',
  },
  numberFormat: '#.00%; -#.00%; -'
});

const scoreStyle = wb.createStyle({
  font: {
    size: 12,
    color: '#EE08EE',
    bold: true
  }
});

const green = wb.createStyle({
  font: {
    size: 12,
    bold: true,
    color: '#08FF08',
  },
  numberFormat: '#.00%; -#.00%; -'
});

const red = wb.createStyle({
  font: {
    size: 12,
    color: '#FF0808',
    bold: true,
  },
  numberFormat: '#.00%; -#.00%; -'
});

const grey = wb.createStyle({
  font: {
    size: 12,
    color: '#EEEEEE',
    bold: true,
  },
  numberFormat: '#.00%; -#.00%; -'
});

const exportResults = async coinToExport => {
  const cursor = await dbManager.getAvailableResults(coinToExport);
  const results = await cursor.toArray();

  results.map(async ({ _id: id, timeoutPrice, batchTimePrice, docId, state, coin, ...rest }, resultIndex) => {
    const preExistingSheet = wb.sheets.find(sheet => sheet.name === coin);
    const ws = preExistingSheet || wb.addWorksheet(coin);

    const shallowObject = { coin, timeoutPriceUSD: timeoutPrice.USD, batchTimePriceUSD: batchTimePrice.USD, ...rest };
    const keys = Object.keys(shallowObject);
    console.log(shallowObject);
    console.log(keys);
    keys.map((key, index) => {
      // set cursor initial position
      let xlCursor = ws.cell(1, index + 1);
      xlCursor.string(key || '')
        .style(headerStyle);
      // set cursor on data position
      xlCursor = ws.cell(2 + resultIndex, index + 1);
      if (!shallowObject[key]) return;
      if (typeof shallowObject[key] === 'number') {
        if (key === 'averageScore')
          xlCursor.number(shallowObject[key] || 0).style(scoreStyle);
        if (key.toLowerCase()?.includes('price'))
          xlCursor.number(shallowObject[key] || 0).style(moneyStyle);
        else
          xlCursor.number(shallowObject[key] || 0).style(numberStyle);
      }
      else if (typeof shallowObject[key] === 'string') {
        if (shallowObject[key] === 'POSITIVE')
          xlCursor.string(shallowObject[key] || '').style(green);

        else if (shallowObject[key] === 'NEGATIVE')
          xlCursor.string(shallowObject[key] || '').style(red);

        else if (shallowObject[key] === 'NEUTRAL')
          xlCursor.string(shallowObject[key] || '').style(grey);

        else xlCursor.string(shallowObject[key] || '').style(defaultStyle);
      }
    });
    ws.cell(2 + resultIndex, 8).formula(`B${2 + resultIndex}-C${2 + resultIndex}`).style(scoreStyle);
    ws.cell(2 + resultIndex, 9).formula(`IF(AND(EXACT(F${2 + resultIndex};"POSITIVE");H${2 + resultIndex}>0);"win";IF(AND(EXACT(F${2 + resultIndex};"NEGATIVE");H${2 + resultIndex}<0);"win";IF(AND(EXACT(F${2 + resultIndex};"NEUTRAL");(ABS(H${2 + resultIndex})<1));"win";"loose")))`)

    wb.write('output/results.xlsx');

    console.log(`processed ${results.length} rows of ${coin}`)
  });
};

const keywords = JSON.parse(await readFile(new URL('./keywords.json', import.meta.url)));
const compilations = keywords.map(async coin => await exportResults(coin.acronym));

Promise.all(compilations).then(successes => {
  console.log(`succesfully processed ${successes.length} coins`);
})
