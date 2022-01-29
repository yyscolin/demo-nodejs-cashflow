const mdb = require('./help-all-mdb')
const getSynsV2 = require('./help-exp11-getSynsV2')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let id = req.params.id
    if (id) {
      if (parseInt(id) != id) throw new Error('404::Page not found')
      var buy = await mdb.get(`
        select buys.id, date_format(date, '%Y-%m-%d') as date, itms.name as itm, cur, amt, ents.name as ent, remarks
        from buys
          left join itms on buys.itm = itms.id
          left join ents on buys.ent = ents.id
        where buys.id = ${id}
      `)
      if (!buy) throw new Error('404::Page not found')
      buy.pays = await mdb.select(`select id, date_format(date, '%Y-%m-%d') as date, acc, amt from pays where buy = ${id}`)
      var isNew = false
    } else {
      var buy = { id: 'null', date: new Date().toLocaleDateString('fr-CA'), itm: 'F&B', cur: 'SGD', amt: '', ent: '', remarks: '', pays: [] }
      var isNew = true;
    }

    let accs = await mdb.postQuery(`select id, name from accs order by name`)
    let ents = await getSynsV2('ent', buy.ent)
    let itms = await getSynsV2('itm', buy.itm)
    res.render('buys_form', { buy, accs, ents, itms, isNew })
  } catch(err) {
    handleError(res, err)
  }
}