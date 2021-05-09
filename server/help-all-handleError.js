const con = require('./help-all-mdb');

module.exports = async function(res, err) {
  var message = err.message
  await con.postQuery(`rollback`)
  if (/^[0-9]{3}::/.test(message)) {
    var [status, message] = message.split('::')
    return res.status(status).send(message)
  }

  console.log(err)
  // try {
  //   let dbResponse = await con.postQuery(`insert into mwz.errs (msg) values ("${message}")`)
  //   res.status(500).send(`${dbResponse.insertId}`)
  // } catch(err) {
  //   res.status(500).send(`100000000`)
  // }
}