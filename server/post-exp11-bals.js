
module.exports = async function(req, res) {
  try {
    var bals = req.body
    if (bals.length) {
      bals = bals.map(_ => `( "${_.date}", ${_.acc},${_.amt})`)
      await con.postQuery(`insert into bals (date, acc, amt) values ${bals.toString()} on duplicate key update date=values(date), acc=values(acc), amt=values(amt)`)
    }
    res.send()
  } catch(err) {
    console.error(err)
    res.status(500).send(`Internal server error`)
  }
}