const mdb = require('./help-all-mdb')
const dday = new Date('2018-11-04').getTime() //Sunday of Week1

module.exports = async function(req, res) {
  try {
    let date = new Date(dday + (req.params.week*7-1)*24*60*60*1000).toLocaleDateString('fr-CA')
    let bals = await mdb.postQuery(`
      select id as acc, name, ifnull(amt, '') as amt
      from accs
      left join (
        select acc, amt from bals where date = '${date}'
      ) t on accs.id = t.acc
      order by name
    `)
    res.render('bals_form', { date, bals })
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}