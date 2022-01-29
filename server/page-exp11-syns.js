const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let table = req.url.split('/')[1]
    let objs = await mdb.select(`select id, name from ${table} order by name`)
    let syns = await mdb.select(`select id, of, name from ${table}_syns`)
    objs.forEach(obj => {
      obj.syns = []
      syns.filter(syn => syn.of == obj.id).forEach(syn => {
        obj.syns.push({
          id: syn.id,
          name: syn.name
        })
      })
    })
    res.render('syns', { table, objs })
  } catch(err) {
    handleError(res, err)
  }
}