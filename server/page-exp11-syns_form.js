const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let table = req.url.split('/')[1]
    let id = req.url.split('/')[3]
    if (id) {
      if (id != parseInt(id)) throw new Error('400::Page not found')
      var query = table == 'itms'
        ? `select id, name, subname, cat from itms where id = ${id}`
        : `select id, name from ${table} where id = ${id}`
      var obj = await mdb.get(query)
      if (!obj) throw new Error('400::Page not found')
      obj.syns = await mdb.select(`select id, name from ${table}_syns where of = ${id}`)
      var isNew = false
    } else {
      var obj = {
        name: '',
        syns: []
      }
      var isNew = true
    }
    let payload = { table, obj, isNew }
    if (table == 'itms') {
      var query = isNew
        ? `select id, name, "" as selected from itms order by name`
        : `select id, name, if(id=${obj.cat}," selected","") as selected from itms where id != ${id} order by name`
      payload.cats = await mdb.select(query)
    }
    res.render('syns_form', payload)
  } catch(err) {
    handleError(res, err)
  }
}