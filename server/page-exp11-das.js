const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

module.exports = async function(req, res) {
  try {
    let today = new Date()
    let cutoffDate = new Date(today.getTime() - (today.getDay()+7*16+1)*24*60*60*1000) //Saturday from 16 weeks ago
    let cutoffString = cutoffDate.toLocaleDateString('fr-CA')

    let buys = await mdb.postQuery(`select date_format(date, "%Y-%m-%d") as date, itm, amt from exp11.buys where itm = 1 and date >= "${cutoffString}"`)
    let ezlink_ints = await mdb.postQuery('select date, de_amt as amt from exp11.ints where de_acc in (3,4)')

    let t1 = `select "${cutoffString}" as date`
    for (let i = 1; i <= 16; i++) {
      t1 += ` union select "${new Date(cutoffDate.getTime() + i*7*24*60*60*1000).toLocaleDateString('fr-CA')}"`
    }
    let t2 = `(
      select date, sum(amt) as amt
      from exp11.bals
      where acc in (3,4)
      group by date
    ) t2`
    let query = `
      select t1.date as date_end, ezlink_amt_end
      from (${t1}) t1
      left join (
        select "${cutoffString}" as date, max(amt) as ezlink_amt_end
        from ${t2}
        where date <= "${cutoffString}"
        union
        select * from ${t2}
        where date > "${cutoffString}"
      ) t3 on t1.date = t3.date
    `
    let exps = await mdb.postQuery(query)
    exps[1].ezlink_amt_start = exps[0].ezlink_amt_end
    exps.splice(0, 1)
    for (let i = 0; i < exps.length; i++) {
      exps[i].date_end = new Date(exps[i].date_end)
      exps[i].date_start = new Date(exps[i].date_end.getTime() - 6*24*60*60*1000)
      exps[i].period = `${exps[i].date_start.toLocaleDateString('fr-CA')} ⇔ ${exps[i].date_end.toLocaleDateString('fr-CA')}`
      if (!exps[i].ezlink_amt_end) exps[i].ezlink_amt_end = exps[i].ezlink_amt_start
      exps[i]['public_transport'] = exps[i].ezlink_amt_start - exps[i].ezlink_amt_end
      ezlink_ints.filter(_ => {
        let date = new Date(_.date)
        return date >= exps[i].date_start && date <= exps[i].date_end
      }).forEach(_ => {
        exps[i]['public_transport'] += _.amt
      })
      exps[i]['public_transport'] = Math.round(exps[i]['public_transport'] * 100) / 100
      if (exps[i+1]) exps[i+1].ezlink_amt_start = exps[i].ezlink_amt_end
      delete exps[i].ezlink_amt_start
      delete exps[i].ezlink_amt_end

      exps[i]['F&B'] = 0
      buys.filter(_ => {
        let date = new Date(_.date)
        return date >= exps[i].date_start && date <= exps[i].date_end && _.itm == 1
      }).forEach(_ => {
        exps[i]['F&B'] += _.amt
      })
      exps[i]['F&B'] = Math.round(exps[i]['F&B'] * 100) / 100

      delete exps[i].date_start
      delete exps[i].date_end
    }
    res.render('das', {exps})
  } catch(err) {
    handleError(res, err)
  }
}