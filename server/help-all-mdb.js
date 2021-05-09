const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS
})

con.connect(err => {
  if (err) console.log(err.message)
  else console.log(`Established connection with MySQL Database`);
});

con.postQuery = function(query) {
  return new Promise((resolve, reject) => {
    this.query(query, (err, result) => {
      if (err) reject(err);
      else {
        resolve(result);
      }
    });
  });
}

con.get = async function(query) {
  let dbResponse = await con.postQuery(query)
  if (dbResponse.length < 1) return null
  let payload = {}
  for (let [key, value] of Object.entries(dbResponse[0])) {
    payload[key] = value
  }
  return payload
}

con.select = async function(query) {
  let array = []
  let dbResponse = await con.postQuery(query)
  dbResponse.forEach(_ => {
    let object = {}
    for (let [key, value] of Object.entries(_)) {
      object[key] = value
    }
    array.push(object)
  })
  return array
}

module.exports = con;
