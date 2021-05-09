const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

function getDateRange(inputWeek) {
  const d1 = new Date('2018-11-04').getTime()
  let curWeek = Math.floor((new Date().getTime() - d1) / (7*24*60*60*1000))
  var week = inputWeek ? inputWeek - 1 : curWeek - 1
  let buttons = 2

  /** If entered week is greater than existing */
  if (week > curWeek) return null

  /** Disable previous page button if week 1 */
  if (week === 0) buttons--
  /** Disable next page button if max week */
  else if (week === curWeek) buttons -= 2

  let dats = [0, 6].map(dat => {
      return new Date(d1 + (week*7+dat)*24*60*60*1000).toLocaleDateString('fr-CA')
  })

  return { dats, week, buttons }
}

module.exports = async function(req, res) {
  try {
    let payload = getDateRange(req.params.week)
    if (!payload || payload.week === 0) return res.status(400).send('Page not found')
    
    payload.bals = await mdb.postQuery(`
      select
        name as acc,
        start,
        ifnull(pays, 0) as pays,
        ifnull(round(ints, 2), 0) as ints,
        ifnull(exts, 0) as exts,
        balance,
        if(name like 'ez-link%', 0, round(start-balance+ifnull(pays,0)+ifnull(ints,0)+ifnull(exts,0), 2)) as error
      from (
        select acc, amt as start
        from exp11.bals
        where (date, acc) in (
          select max(date), acc
          from (
            select date, acc from exp11.bals
            where date < '${payload.dats[0]}'
          ) t group by acc
        )
      ) start right join (
        select acc, amt as balance from exp11.bals where id in (select max(id) from exp11.bals where date>='${payload.dats[0]}' and date<='${payload.dats[1]}' group by acc)`
        // select acc, amt as balance
        // from exp11.bals
        // where (date, acc) in (
        //   select max(date), acc
        //   from (
        //     select date, acc
        //     from exp11.bals
        //     where date <= '${payload.dats[1]}'
        //   ) t group by acc
        // )
      +`) balance using (acc) left join (
        select acc, sum(amt) as pays
        from exp11.pays
        where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}'
        group by acc
      ) pays using (acc) left join (
        select acc, sum(amt) as ints
        from (
          select sr_acc as acc, sr_amt*-1 as amt
          from exp11.ints
          where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}'
          union all
          select de_acc as acc, de_amt as amt
          from exp11.ints
          where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}'
        ) t group by acc
      ) ints using (acc) left join (
        select acc, sum(amt) as exts
        from exp11.exts
        where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}'
        group by acc
      ) exts using (acc) join
      exp11.accs on acc = accs.id
      order by acc
    `)
    payload.ints = await mdb.postQuery(`select ints.id, date_format(date, '%Y-%m-%d') as date, t1.name as sr, t2.name as de, sr_amt, de_amt from exp11.ints join exp11.accs t1 on ints.sr_acc = t1.id join exp11.accs t2 on ints.de_acc = t2.id where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}'`)
    payload.pays = await mdb.postQuery(`select pays.id, buy, date_format(pays.date, '%Y-%m-%d') as date, itms.name as itm, accs.name as acc, pays.amt, ents.name as ent, remarks from exp11.pays join exp11.buys on pays.buy = buys.id join exp11.accs on pays.acc = accs.id join exp11.itms on buys.itm = itms.id left join exp11.ents on buys.ent = ents.id where pays.date >= '${payload.dats[0]}' and pays.date <= '${payload.dats[1]}' order by pays.date`)
    payload.exts = await mdb.postQuery(`select exts.id, date_format(date, '%Y-%m-%d') as date, tfts.name as tft, accs.name as acc, amt, remarks is not null as remarks from exp11.exts left join exp11.tfts on exts.tft = tfts.id join exp11.accs on exts.acc = accs.id where date >= '${payload.dats[0]}' and date <= '${payload.dats[1]}' order by date`)
    res.render('wcfs', payload)
  } catch(err) {
    handleError(res, err)
  }
}