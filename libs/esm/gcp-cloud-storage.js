

const gcpHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

async function deleteGoogle (filename) {
  try {
    const rv = await http.post('/api/gcp-sign', { filename, action: 'delete' }, null, gcpHeaders)
    const res2 = await http.del(rv.data.url)
    // console.log(res2)
    console.log('Google Delete: ' + (res2.ok) ? 'OK' : 'FAIL') 
  } catch (e) {
    console.log('Google Delete: ' + e.toString())
  }
}

async function uploadGoogle (file) { // only 1 file at a time, use for loop for multiples
  try {
    const filename = file.name
    const rv = await http.post('/api/gcp-sign', { filename, action: 'write' }, null, gcpHeaders)
    console.log(rv.data.url)
    const res2 = await http.put(rv.data.url, file, null,  { 'Content-Type': 'application/octet-stream' })
    console.log('Google Upload: ' + (res2.ok) ? 'OK' : 'FAIL') 
  } catch (e) {
    console.log('Google Upload: ' + e.toString())
  }
}

async function readGoogle (filename) {
  try {
    const rv = await http.post('/api/gcp-sign', { filename, action: 'read' }, null, gcpHeaders)
    const decoder = new TextDecoder('utf-8')
    fetch(rv.data.url, { method: 'GET' }).then(response => {
      response.body
        .getReader()
        .read()
        .then(({value, done}) => {
          console.log(done, "boo", decoder.decode(value))
        })
    })
    // const xxx = await res2.body.getReader().read()
    // console.log(xxx)
    // alert('Google Read: ' + (res2.ok) ? 'OK' : 'FAIL')   
  } catch (e) {
    console.log('readGoogle', e.toString())
  }
}

export {
  uploadGoogle, deleteGoogle, readGoogle
}
