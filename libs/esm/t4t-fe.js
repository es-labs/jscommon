import Fetch from './fetch.js'
import { validateColumn } from './t4t-validate.js'
let tableName = ''
let parentFilter = null
let config = null
let urlPrefix = '/api'
let http = new Fetch()
// TODO i18n

// this might change
function setTableName(name) { // set table name
  tableName = name
  parentFilter = null // TODO: find a more sustainable way using prototype
}

// this might change
const setFetch = (_fetch) => http = _fetch // set the fetch function
const setParentFilter = (_filter) => parentFilter = _filter
const setUrlPrefix = (_urlPrefix) => urlPrefix = _urlPrefix

// type: string, date, datetime, time, integer, float
// {
//   rules: {
//     min: 0, // string, date, datetime, time, integer, float
//     max: 10, // string, date, datetime, time, integer, float
//     regex: 10, // string
//     gt: 'field', // date, datetime, time, integer, float
//     gte: 'field', // date, datetime, time, integer, float
//     lt: 'field', // date, datetime, time, integer, float
//     lte: 'field', // date, datetime, time, integer, float
//     dec: 2 // float
//   ]
// }

function validate(record) {
  for (const col in record) {
    if (config.cols[col]) {
      const { rules, type } = config.cols[col]
      if (rules) {
        const msg = validateColumn(rules, type, col, record)
        if (msg) {
          return { col, msg }
        }
      }
    }
  }
  return null
}

async function getConfig() {
  try {
    const { data } = await http.get(urlPrefix + '/t4t/config/' + tableName)
    if (data) {
      config = data
      // for (const col in config.cols) {
      //   const obj = config.cols[col]
      //   if (obj.table !== 'hide') headerCols.push({ path: col, header: obj.label }) // process table columns
      //   if (obj.filter !== 'hide') filterCols.push(col) // process filters
      // }
      // Object.entries(config.cols) => [ [key, obj], ... ]
    }
    return config
  } catch (e) {
  }
  return null
}

async function find(filters, sorter, page, limit) {
  let rv = {
    results: [],
    total: 0
    // cursor: '' // props.infinite
  }
  if (parentFilter) {
    filters.push({col: parentFilter.col, op: "=", val: parentFilter.id, andOr: "and"})
  }
  try {
    filters = filters ? JSON.stringify(filters) : '' // [{col, op, val, andOr}, ...]
    sorter = sorter ? JSON.stringify(sorter) : '' // [{ column: '<col_name>', order: 'asc|desc' }, ...]
    const { data } = await http.get(urlPrefix + '/t4t/find/' + tableName, {
      page, limit, filters, sorter 
    })
    rv.results = data.results
    rv.total = data.total
    // rv.cursor = data.cursor
  } catch (e) {
  }
  return rv
}

async function download(filters, sorter) {
  try {
    const { data } = await http.get(urlPrefix + '/t4t/find/' + tableName, {
      page: 0,
      limit: 0,
      csv: 1, // it is a csv
      filters: JSON.stringify(filters),
      sorter: JSON.stringify(sorter)
    })
    return data
  } catch (e) {
    console.log('eee', e.toString())
    return null
  }
}

async function findOne(__key) {
  let rv = {}
  try {
    const { data } = await http.get(urlPrefix + '/t4t/find-one/' + tableName, { __key }) // if multiKey, then seperate values by |, column is implied by order  
    rv.__key = __key
    Object.entries(config.cols).forEach((kv) => {
      const [key, val] = kv
      if (val.edit !== 'hide') {
        rv[key] = data[key]
      }
    })
    return rv
  } catch (e) {
    return null
  }
}

function initItem() {
  let rv = {}
  try {
    Object.entries(config.cols).forEach((kv) => {
      const [key, val] = kv
      if (val.edit !== 'hide') {
        rv[key] = val.default || ''
      }
    })
    return rv  
  } catch (e) {
    return null
  }
}

// process data for use with
// JSON only,  multi-part form, JSON & filelist (signed URL upload)
function processData(record, { signedUrl = false } = { }) {
  const rv = {
    json: { }
  }
  for (const [k, v] of Object.entries(record)) {
    if (v instanceof FileList) {
      const fileNameArray = []
      for (const file of v) {
        if (signedUrl) {
          if (!rv.files) rv.files = []
          rv.files.push(file)
        } else {
          if (!rv.form) rv.form = new FormData()
          rv.form.append('file-data', file) // add
        }
        fileNameArray.push(file.name)
      }
      rv.json[k] = fileNameArray.join(',') // array
    } else {
      rv.json[k] = v
    }
  }
  if (rv.form) rv.form.append('json-data', JSON.stringify(rv.json)) // set the JSON
  return rv
}

async function create(record) {
  // const { data } = await http.patch(`/authors/${id}`, formData,
  //   { onUploadProgress: progressEvent => console.log(Math.round(progressEvent.loaded / progressEvent.total * 100) + '%') } // axios only
  // )
  return await http.post(urlPrefix + `/t4t/create/${tableName}`, record)
}

async function update(__key, record, headers = null) {
  return await http.patch(urlPrefix + `/t4t/update/${tableName}`, record, { __key }, headers)
}

// Handle file removals seperately
async function remove(items) {
  let ids = []
  const { pk } = config
  if (pk) {
    ids = items.map((item) => item[pk])
  } else {
    ids = items.map((item) => item.__key)
  }
  return await http.post(urlPrefix + '/t4t/remove/' + tableName, { ids })  
}

// uploads a single csv for batch processing
async function upload(file) { // the file object
  // TODO add exception handling
  if (file === null) return false
  const formData = new FormData()
  formData.append('csv-file', file) // call it file
  // console.log('zzz', formData instanceof FormData)
  // for(const pair of formData.entries()) console.log(pair[0], pair[1])
  return await http.post(urlPrefix + '/t4t/upload/' + tableName, formData)
  // formData.append('textdata', JSON.stringify({ name: 'name', age: 25 }))
  // const res = await fetch('/api/upload', { method: 'POST', body: formData })
  // const { id, name, avatar } = record
  // const json = JSON.stringify({ name })
  // // const blob = new Blob([json], { type: 'application/json' })
  // // console.log('json', blob)
}


// const autoComplete = debounce(async (e, col, _showForm) => {
// recordObj[_showForm][col] = e.target.value

// wrap in debounce
// parentColVal in use-cases where parent table column changes
async function autocomplete (search, col, record, parentColVal) {
  let res = []
  try {
    const { tableName, limit, key, text, parentTableColName, parentCol } = config.cols[col].options
    const query = { tableName, limit, key, text, search }
    if (parentTableColName) {
      query.parentTableColName = parentTableColName
      query.parentTableColVal = parentColVal || record[parentCol]
    }
    const { data } = await http.get(urlPrefix + '/t4t/autocomplete', query)
    res = data
  } catch (err) {
    console.log('autocomplete', err.message)
  }
  return res
}

export {
  setFetch, setTableName, setParentFilter, setUrlPrefix,
  getConfig, validate, validateColumn,
  find, findOne, initItem, create, update, remove, upload, download, autocomplete, processData,
}
