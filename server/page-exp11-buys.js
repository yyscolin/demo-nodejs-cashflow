const mdb = require('./help-all-mdb')
const handleError = require('./help-all-handleError.js')

async function getSyns(table, checkedIds) {
  return await mdb.postQuery(`
    select t1.id, name, syns, ${checkedIds ? `if(t1.id in (${checkedIds}), true, false)` : 'true'} as isChecked
    from ${table} t1
    join (
      select id, group_concat(syn separator "::") as syns from (
        select id, name as syn from ${table} union select ${table}.id, ${table}_syns.name from ${table} join ${table}_syns on ${table}.id = ${table}_syns.of
      ) tt1 group by id
    ) t2 on t1.id = t2.id order by name
  `)
}

module.exports = async function(req, res) {
  try {
    /** Get date range */
    let d2 = new Date(req.query.d2)
    if (d2 == 'Invalid Date') d2 = new Date()
    let d1 = new Date(req.query.d1)
    if (d1 == 'Invalid Date') d1 = new Date(d2.getTime() - 7*24*60*60*1000)
    if (d1 > d2) {
      let d3 = d1
      d1 = d2
      d2 = d3
    }
    d1 = d1.toLocaleDateString('fr-CA')
    d2 = d2.toLocaleDateString('fr-CA')

    /** Check currency */
    if (!req.query.cur) req.query.cur = 'SGD'

    /** Set sql conditions */
    let queryFilters = `date >= "${d1}" and date <= "${d2}"`
      + ` and buys.cur="${req.query.cur}"`
    if (req.query.itms) queryFilters += ` and itm in (${req.query.itms})`
    if (req.query.ents) {
      queryFilters += ` and (ent in (${req.query.ents})`
      let queryEnts = req.query.ents.split(',')
      var queryEntNone = queryEnts.find(_ => _ == 0)
      if (queryEntNone) queryFilters += ' or ent is null'
      queryFilters += `)`
    }

    let buys = await mdb.postQuery(`
      select buys.id, date_format(date, '%Y-%m-%d') as date,
        itms.name as itm, ents.name as ent, buys.amt as buy,
        remarks, (buys.amt + ifnull(pays.amt, 0)) as fay
      from buys
      left join (
        select buy, sum(amt) as amt
        from pays
        group by buy
      ) pays on buys.id=pays.buy
      left join itms on buys.itm=itms.id
      left join ents on buys.ent=ents.id
      where ${queryFilters}
      order by date
    `)
    let total = {
      buys: 0,
      fays: 0
    }
    buys.forEach(_ => {
      total.buys += _.buy
      total.fays += _.fay
    })
    let objss = {
      bykates: await getSyns('itms', req.query.itms),
      antitis: await getSyns('ents', req.query.ents)
    }
    objss.antitis.unshift({
      id: 0,
      name: '(NONE)',
      syns: '',
      isChecked: queryEntNone ? true : false
    })
    var query = `select distinct currency,
      if(currency="${req.query.cur}", "selected", "") as isSelected
      from accs`
    let currencies = await mdb.postQuery(query)
    for (let [table, objs] of Object.entries(objss)) {
      let smartValues = []
      let displayValues = []
      objs.forEach(obj => {
        if (obj.isChecked) {
          smartValues.push(obj.id)
          displayValues.push(obj.name)
        }
      })
      objss[table].smartValue = smartValues.toString()
      objss[table].displayValue = displayValues.length ? displayValues[0] : ''
      if (displayValues.length > 1) objss[table].displayValue += ` (+${displayValues.length-1} more)`
    }
    
    res.render('buys', { buys, d1, d2, objss, currencies, total })
  } catch(err) {
    handleError(res, err)
  }
}