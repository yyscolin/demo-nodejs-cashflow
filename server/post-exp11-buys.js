const mdb = require('./help-all-mdb')
const getApiRequestId = require('./help-exp11-getApiRequestId')
const getDatabaseIdByName = require('./help-exp11-getDatabaseIdByName')
const fieldValidator = require(`../modules/field-validator`)

module.exports = async function(req, res) {
  let hasTransaction = false
  try {
    var id = getApiRequestId(req)
    var date = req.body.date
    var itm = req.body.itm
    var cur = req.body.cur
    var amt = req.body.amt
    var ent = req.body.ent
    var remarks = req.body.remarks

    const apiErrors = [
      fieldValidator.validateDate(date),
      fieldValidator.validateCurrencyCode(cur),
      fieldValidator.validateAmount(amt),
    ]
    for (const apiError of apiErrors)
      if (apiError) return res.status(400).send(apiError)
    
    if (itm) itm = await getDatabaseIdByName(`itms`, itm)

    if (ent) ent = await getDatabaseIdByName(`ents`, ent)

    await mdb.postQuery('start transaction')
    hasTransaction = true
    var dbResponse = await mdb.postQuery(`
      insert into buys (id, date, itm, cur, amt, ent, remarks) values (?,?,?,?,?,?,?)
      on duplicate key update date=values(date), itm=values(itm), amt=values(amt), ent=values(ent), remarks=values(remarks)
    `, [id, date, itm, cur, amt, ent, remarks])

    if (req.body.pays.length) {
      if (!id) var id = dbResponse.insertId
      var pays = []
      for (const pay of req.body.pays) {
        const apiErrors = [
          fieldValidator.validateDate(pay.date),
          fieldValidator.validateAccountId(pay.acc),
          fieldValidator.validateAmount(pay.amt),
        ]
        for (const apiError of apiErrors)
          if (apiError) {
            await mdb.postQuery(`rollback`)
            return res.status(400).send(apiError)
          }

        pays.push([pay.id, id, pay.date, pay.acc, pay.amt])
      }
      await mdb.postQuery(`
        insert into pays (id, buy, date, acc, amt) values ?
        on duplicate key update date=values(date), acc=values(acc), amt=values(amt)
      `, [pays])
    }
    await mdb.postQuery('commit')
    res.send()
  } catch(err) {
    console.error(err)
    if (hasTransaction) await mdb.postQuery(`rollback`)
    res.status(500).send(`Internal server error`)
  }
}