const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')
const dday = new Date('2018-11-04').getTime() //Sunday of Week1

module.exports = async function(req, res) {
  try {
    let date = new Date(dday + (req.params.week*7-1)*24*60*60*1000).toLocaleDateString('fr-CA')
    let bals = await mdb.postQuery(`
      select id as acc, name, ifnull(amt, '') as amt
      from exp11.accs
      left join (
        select acc, amt from exp11.bals where date = '${date}'
      ) t on accs.id = t.acc
      order by name
    `)
    res.render('bals_form', { date, bals })
  } catch(err) {
    handleError(res, err)
  }
}