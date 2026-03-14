'use strict'
// use csv-parse and @json2csv/plainjs instead

// PROBLEMS
// 1. what if columns are not same (use less or use more) ?
// 2. what if row is missing

// RFC 4180
// https://stackoverflow.com/a/41563966
// https://www.convertcsv.com/json-to-csv.htm
// double quote only required if field contains newline characters
// check if valid json key syntax
const DELIM_ROW = "\n" // end of line \r\n for Windows \n for Linux
const DELIM_COL = ','
const ESCAPE_CHAR = '""'
const QUOTE_CHAR = '"'
const CHAR_CR = '\r'
const CHAR_LF = '\n'

/**
 * 
 * @param {string[][]} csvString - CSV parsed as array of rows, each row is an array of fields
 * @returns {object} - { valid: boolean, reason?: string, rows?: string[][] }
 * @throws {Error} - if CSV is invalid (e.g. unclosed quotes)
 */
const parseAndValidateCsv = (csvString) => {
  try {
    const rows = parseCSV(csvString);
    for (const row of rows) {
      for (const field of row) {
        // Catches objects {}, arrays [], strings "...", numbers, booleans, null
        const looksLikeJSON = /^[[{"'\-\d]|^(true|false|null)$/.test(field.trim());
        if (looksLikeJSON) {
          try {
            JSON.parse(field);
          } catch {
            return { valid: false, reason: `Corrupted JSON in field: ${field.slice(0, 50)}` };
          }
        }
      }
    }
    return { valid: true, rows };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

/**
 * RFC 4180-compliant CSV parser (handles quoted fields with embedded commas/newlines)
 * - 1. escaped correctly
 * - 2. same number of columns in each row (TBD?)
 * - 3. trims white space around fields (TBD?)
 * @param {string} str - CSV string to parse
 * @returns {string[][]} - array of rows, each row is an array of fields
 * @throws {Error} - if CSV is invalid (e.g. unclosed quotes)
 */
const parseCSV = (str, delimCol=DELIM_COL) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < str.length) {
    const ch = str[i];
    const next = str[i + 1];

    if (inQuotes) {
      if (ch === QUOTE_CHAR && next === QUOTE_CHAR) {
        field += QUOTE_CHAR;   // "" → single "
        i += 2;
      } else if (ch === QUOTE_CHAR) {
        inQuotes = false;
        i++;
      } else {
        field += ch;
        i++;
      }
    } else {
      if (ch === QUOTE_CHAR) {
        inQuotes = true;
        i++;
      } else if (ch === delimCol) {
        row.push(field);
        field = '';
        i++;
      } else if (ch === CHAR_LF || ch === CHAR_CR) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
        if (ch === CHAR_CR && next === CHAR_LF) i++; // handle \r\n
        i++;
      } else {
        field += ch;
        i++;
      }
    }
  }

  // Push last field/row
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  if (inQuotes) throw new Error('Unclosed quoted field — invalid CSV');
  return rows;
}

/**
 * convert CSV to array of JSON object
 * @param {object} input - conversion inputs
 * @param {string} input._text - CSV text to be converted to array
 * @param {string} input.delimCol - CSV column delimiter, default is comma (,)
 * @param {boolean} input.ignoreColumnMismatch - whether to ignore column count mismatches
 * @returns 
 */
const csvToJson = ({ _text, delimCol = DELIM_COL, ignoreColumnMismatch = false}) => {
  const arr = parseCSV(_text, delimCol);
  const headers = arr.shift() // 1st row is the headers
  return arr.map((row) => {
    const rv = {}
    if (headers.length != row.length && !ignoreColumnMismatch) throw new Error(`Mismatch headers(${headers.length}) != columns (${row.length})`)
    headers.forEach((_, index) => {
      rv[headers[index]] = row[index]
    })
    return rv
  })
}

// const testString = [
//   {
//     a: 1, b: "n1,n2", c: true, d: new Date(),
//     e: { e1: "Hello \"World\" 1", e2: [1, 2, "4"], tt: () => "22" },
//     f: "bl,ah = 24\"", g: null
//   },
//   {
//     a: 2, b: "k1,k2", d: new Date(), c: false,
//     e: { e3: () => [1, 2, "4"] },
//     f: "bl,aba,\"h = 24\"", h: () => '2', k: "\"2 [\n\\\\\]2\"", m: "dvs\r\n444\"55"
//     // m: undefined // this will throw an error which is good
//   }
// ]

// causing problems ( ", )
// a,b,c
// "asd","123",11
// "a",sd","12,,"3",""\"=".\""3"

// INPUT
// { "aa": "123 456", "bb": "dvs\r\n444\"55", "cc": "aa\"b,b" }

// OUTPUT
// aa,bb,cc
// 123 456,"dvs
// 444""55","aa""b,b"

// [
//   { "a": "asd", "b": "123", "c": "11" },
//   { "a": "a", "b": "sd\"", "c": "12,,\"3", "__parsed_extra": [ "\"\\\"=\".\\\"3" ] }
// ]
// { "abc": "11,22,33,\",\"44", "def": 456, "ghi": "hello, world" }
//
// abc,def,ghi
// "11,22,33,"",""44",456,"hello, world" // now how to parse field delimiter

/**
 * Converts an array of fields to a CSV row, escaping values as needed.
 * escape for Excel, Google Sheets, and RFC 4180-compliant parsers
 * 
 * @param {*[]} fields - array of field values to convert to a CSV row
 * @param {string} delimCol - CSV column delimiter, default is comma (,)
 * @returns {string} - CSV datarow string
 */
const arrayToCSVRow = (fields, delimCol = DELIM_COL) =>{
  return fields.map(field => {
    if (field === null || field === undefined) return '';
    if (typeof field === 'object') {
      const jsonStr = JSON.stringify(field).replace(/"/g, '""');
      return `"${jsonStr}"`;
    }
    // Wrap any plain string containing commas/quotes/newlines too
    if (typeof field === 'string' && /[",\n]/.test(field)) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }).join(delimCol);
}

/**
 * Converts JSON object values to a CSV data row, escaping values as needed.
 * escape for Excel, Google Sheets, and RFC 4180-compliant parsers
 * 
 * @param {Object} jsonObj - JSON object to convert to a CSV row
 * @param {string} delimCol - CSV column delimiter, default is comma (,)
 * @returns {string} - CSV data row string
 */
const jsonToCSVRow = (jsonObj, delimCol = DELIM_COL) => arrayToCSVRow(Object.values(jsonObj), delimCol);

/**
 * Converts JSON object keys to a CSV header row, escaping values as needed.
 * escape for Excel, Google Sheets, and RFC 4180-compliant parsers
 * 
 * @param {Object} jsonObj - JSON object to convert to a CSV row
 * @param {string} delimCol - CSV column delimiter, default is comma (,)
 * @returns {string} - CSV header row string
 */
const jsonToCSVHeader = (jsonObj, delimCol = DELIM_COL) => arrayToCSVRow(Object.keys(jsonObj), delimCol);

/**
 * convert array of JSON objects to CSV
 * @param {Object[]} _json - array of JS objects to be converted to CSV
 * @param {string} delimRow - CSV row delimiter, default is newline (\n)
 * @param {string} delimCol - CSV column delimiter, default is comma (,)
 * @param {boolean} ignoreColumnMismatch - whether to ignore column count mismatches
 * @returns 
 */
const jsonToCsv = (_json, delimCol=DELIM_COL, delimRow=DELIM_ROW, ignoreColumnMismatch=false) => {
  let csv = ''
  let headers = []
  if (Array.isArray(_json)) _json.forEach((row, index) => {
    if (index === 0) { // create 1st row as header
      headers = Object.keys(row)
      csv += (jsonToCSVHeader(row, delimCol) + delimRow)
    }
    const data = Object.values(row)
    if (headers.length !== data.length && !ignoreColumnMismatch) throw new Error(`Mismatch headers(${headers.length}) != columns (${data.length})`)
    else csv += (arrayToCSVRow(data, delimCol) + delimRow)
  })
  return csv
}

export {
  arrayToCSVRow,
  jsonToCSVHeader,
  jsonToCSVRow,
  jsonToCsv,
  parseAndValidateCsv,
  parseCSV, // to array of arrays, non validating
  csvToJson,
}
