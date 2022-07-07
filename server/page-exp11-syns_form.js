const mdb = require('./help-all-mdb')

module.exports = async function(req, res) {
  try {
    const [, table,, id] = req.url.split('/')
    if (table != `itms`)
      return res.status(404).send(`Page not found`)

    const pageContext = {
      isNew: true,
      obj: {
        name: ``,
      },
    }

    if (id) {
      if (id != parseInt(id))
        return res.status(404).send(`Page not found`)
      const query = `select id, name, cat from itms where id=${id}`
      pageContext.obj = await mdb.get(query)
      if (!pageContext.obj)
        return res.status(404).send(`Page not found`)
      pageContext.isNew = false
    }

    const query = pageContext.isNew
      ? `select id, name, "" as selected from itms order by name`
      : `select id, name, if(id=${pageContext.obj.cat}," selected","") as selected from itms where id != ${id} order by name`
    pageContext.cats = await mdb.select(query)
    res.render(`syns_form`, pageContext)
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}