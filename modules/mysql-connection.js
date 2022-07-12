const mysql = require(`mysql`)

const mysqlConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST || `localhost`,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT || 3306,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true,
})

mysqlConnection.connect(err => {
  if (err) console.log(err.message)
  else console.log(`Established connection with MySQL Database`)
})

mysqlConnection.postQuery = function(query, params = []) {
  return new Promise((resolve, reject) => {
    this.query(query, params, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

/** Get an array of {} */
mysqlConnection.getObjects = async function(query, params = []) {
  const dbResponse = await mysqlConnection.postQuery(query, params)
  return dbResponse.map(dbRow => {
    const parsedObject = {}
    for (const [key, value] of Object.entries(dbRow)) {
      parsedObject[key] = value
    }
    return parsedObject
  })
}

/** Get a single {}, return first if multiple results */
mysqlConnection.getObject = async function(query, params = []) {
  const dbResponse = await mysqlConnection.getObjects(query, params)
  return dbResponse[0] || null
}

/** Get an array of values */
mysqlConnection.getValues = async function(query, params = []) {
  const dbResponse = await mysqlConnection.getObjects(query, params)
  if (!dbResponse.length) return []
  const keyToUse = Object.keys(dbResponse[0])[0]
  return dbResponse.map(object => object[keyToUse])
}

/** Get a single value */
mysqlConnection.getValue = async function(query, params = []) {
  const values = await mysqlConnection.getValues(query, params)
  return values[0] || null
}

module.exports = mysqlConnection;
