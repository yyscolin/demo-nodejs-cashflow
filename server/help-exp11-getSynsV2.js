const mdb = require('./help-all-mdb')

module.exports = async function(table, match) {
  let objs = await mdb.postQuery(`
    select ${table}s.id, name, syns from exp11.${table}s join (
      select id, group_concat(syn separator "::") as syns from (
        select id, name as syn from exp11.${table}s union select ${table}s.id, ${table}s_syns.name from exp11.${table}s join exp11.${table}s_syns on ${table}s.id = ${table}s_syns.of
      ) t1 group by id
    ) t2 on ${table}s.id = t2.id order by name
  `)
  var regex = new RegExp(match?'(^|::| )'+match:'', 'i')
  objs.forEach(obj => {
    obj.class = regex.test(obj.name) ? 'smart-option selected' : 'smart-option'
  })
  return objs
}