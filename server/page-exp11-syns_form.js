const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    const [, table,, id] = req.url.split('/')
    if (table != `itms`) throw new Error('400::Page not found')

    const pageContext = {
      isNew: true,
      obj: {
        name: ``,
      },
    }

    if (id) {
      if (id != parseInt(id)) throw new Error('400::Page not found')
      const query = `select id, name, subname, cat from itms where id=${id}`
      pageContext.obj = await mdb.get(query)
      if (!pageContext.obj) throw new Error('400::Page not found')
      pageContext.isNew = false
    }

    const query = pageContext.isNew
      ? `select id, name, "" as selected from itms order by name`
      : `select id, name, if(id=${pageContext.obj.cat}," selected","") as selected from itms where id != ${id} order by name`
    pageContext.cats = await mdb.select(query)
    res.render(`syns_form`, pageContext)
  } catch(err) {
    handleError(res, err)
  }
}