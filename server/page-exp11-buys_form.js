const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

const SQL_QUERY_1 = `
select buys.id,
date_format(date, '%Y-%m-%d') as date,
itms.name as itm,
cur,
amt,
ents.name as ent,
remarks
from buys
  left join itms on buys.itm = itms.id
  left join ents on buys.ent = ents.id
where buys.id=?
`

module.exports = async function(req, res) {
  try {
    let id = req.params.id
    if (id) {
      if (parseInt(id) != id) throw new Error('404::Page not found')
      var buy = await mdb.getObject(SQL_QUERY_1, [id])
      if (!buy) throw new Error('404::Page not found')
      buy.pays = await mdb.select(`select id, date_format(date, '%Y-%m-%d') as date, acc, amt from pays where buy = ${id}`)
      var isNew = false
    } else {
      var buy = { id: 'null', date: new Date().toLocaleDateString('fr-CA'), itm: 'F&B', cur: 'SGD', amt: '', ent: '', remarks: '', pays: [] }
      var isNew = true;
    }

    let [accs, ents, itms, currencies] = await Promise.all([
      mdb.getObjects(`select id, name, currency from accs order by name`),
      mdb.getValues(`SELECT name FROM ents`),
      mdb.getValues(`SELECT name FROM itms`),
      mdb.getValues(`select distinct(currency) from accs order by currency`)
    ])
    res.render('buys_form', { buy, accs, ents, itms, currencies, isNew })
  } catch(err) {
    handleError(res, err)
  }
}