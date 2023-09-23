'use strict'
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

function csvToArray({ text, delimCol = DELIM_COL }) {
  let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l
      s = !s
    } else if (delimCol === l && s) l = row[++i] = ''
    else if ('\n' === l && s) {
      if ('\r' === p) row[i] = row[i].slice(0, -1)
      row = ret[++r] = [l = '']
      i = 0
    } else row[i] += l
    p = l
  }
  if (
    ret?.length
    && ret[ret.length - 1]?.length === 1
    && ret[ret.length - 1][0] === ''
  ) {
    ret.pop() // remove last element of ret
  }
  return ret
}

function arrayToCsv({ row, delimCol = DELIM_COL }) {
  for (let i in row) {
    row[i] = row[i].replace(/"/g, '""')
  }
  console.log(row)
  return '"' + row.join(`"${delimCol}"`) + '"'
}

function json2csv({ _json, delimCol = DELIM_COL, delimRow = DELIM_ROW }) {
  let csv = ''
  let headers = []
  // let colCount = 0 // check column counts match if not throw error?
  if (Array.isArray(_json)) _json.forEach((row, index) => {
    if (index === 0) {
      headers = Object.keys(row)
      csv += (arrayToCsv({ row: headers, delimCol }) + delimRow)
    }
    const vals = Object.values(row).map((col) => {
      return (typeof col === 'object') ? JSON.stringify(col) : col.toString()
    })
    // if (headers.length != vals.length) throw new Error(`mismatch on columns headers count ${headers.length} != values count ${vals.length}`)
    csv += (arrayToCsv({ row: vals, delimCol }) + delimRow)
  })
  return csv
}

function csv2json({ _text, delimCol = DELIM_COL}) {
  // converting csv to json...
  const arr = csvToArray({ text: _text, delimCol })
  // TBD form JSON from array, 1st row being the best
  const headers = arr.shift()
  return arr.map((row) => {
    const rv = {}
    headers.forEach((_, index) => {
      rv[headers[index]] = row[index]
    })
    return rv
  })
}

const testString = [
  {
    a: 1, b: "n1,n2", c: true, d: new Date(),
    e: { e1: "Hello \"World\" 1", e2: [1, 2, "4"], tt: () => "22" },
    f: "bl,ah = 24\"", g: null
  },
  {
    a: 2, b: "k1,k2", d: new Date(), c: false,
    e: { e3: () => [1, 2, "4"] },
    f: "bl,aba,\"h = 24\"", h: () => '2', k: "\"2 [\n\\\\\]2\"", m: "dvs\r\n444\"55"
    // m: undefined // this will throw an error which is good
  }
]

// causing problems ( ", )
// a,b,c
// "asd","123",11
// "a",sd","12,,"3",""\"=".\""3"

// INPUT
// {
//   "aa": "123 456",
//   "bb": "dvs\r\n444\"55",
//   "cc": "aa\"b,b"
// }

// OUTPUT
// aa,bb,cc
// 123 456,"dvs
// 444""55","aa""b,b"

// [
//   { "a": "asd", "b": "123", "c": "11" },
//   { "a": "a", "b": "sd\"", "c": "12,,\"3", "__parsed_extra": [ "\"\\\"=\".\\\"3" ] }
// ]

function testJsonCsv () {
  const _csv = json2csv({ _json: testString })
  console.log(_csv)

  const _json = csv2json({ _text: _csv })
  console.log(_json)
}

function testArrayCsv () {
  let rows = [
    [ "one", "two with escaped \" double quote", "three, with, commas", "four with no quotes (now has)", "five for fun", "six\r\nhas multiple\r\nlines" ],
    [ "one", "two with escaped \" double quote", "three, with, commas", "four with no quotes (now has)", "five for fun", "six\r\nhas multiple\r\nlines" ]
  ]

  let csvStr = ''
  rows.forEach((row) => csvStr += (arrayToCsv({row}) + DELIM_ROW))
  console.log(csvStr)

  console.log(
    csvToArray({ text: csvStr })
  )
}

// testJsonCsv()
// testArrayCsv()

// { "abc": "11,22,33,\",\"44", "def": 456, "ghi": "hello, world" }
//
// abc,def,ghi
// "11,22,33,"",""44",456,"hello, world" // now how to parse field delimiter

export {
  json2csv,
  csv2json
}
