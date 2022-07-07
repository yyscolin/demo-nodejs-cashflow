const mysql = require('mysql');

const con = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT || 3306,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
})

con.connect(err => {
  if (err) console.log(err.message)
  else console.log(`Established connection with MySQL Database`);
});

con.postQuery = function(query, params = []) {
  return new Promise((resolve, reject) => {
    this.query(query, params, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/** Get an array of {} */
con.getObjects = async function(query, params = []) {
  let array = []
  let dbResponse = await con.postQuery(query, params)
  dbResponse.forEach(_ => {
    let object = {}
    for (let [key, value] of Object.entries(_)) {
      object[key] = value
    }
    array.push(object)
  })
  return array
}

/** Get a single {}, return first if multiple results */
con.getObject = async function(query, params = []) {
  let dbResponse = await con.postQuery(query, params)
  if (dbResponse.length < 1) return null
  let payload = {}
  for (let [key, value] of Object.entries(dbResponse[0])) {
    payload[key] = value
  }
  return payload
}

/** Get an array of values */
con.getValues = async function(query, params = []) {
  let objects = await con.getObjects(query, params)
  if (!objects.length) return []
  let key = Object.keys(objects[0])[0]
  return objects.map(_ => _[key])
}

/** Get a single value */
con.getValue = async function(query, params = []) {
  let values = await con.getValues(query, params)
  return values.length ? values[0] : null
}

con.get = async function(query, params = []) {
  let dbResponse = await con.postQuery(query, params)
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
