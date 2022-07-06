require('dotenv').config({path: `${__dirname}/.env`});
const https = require('https')
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const uuid = require('uuid/v4');
const session = require('express-session');
const fs = require('fs')

/** bodyparser middleware */
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

/** Set session ID */
app.use(session({
  genid: () => {
    return uuid()
  },
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

/** Check if session is authorised */
let authorisedSession;
app.post('/login', (req, res) => {
  let password = req.body.id
  if (password == 'testPassword') {
    authorisedSession = req.sessionID;
    res.send();
  } else
    res.status(400).send();
})

app.use((req, res, next) => {
  let isAuthorised = req.sessionID == authorisedSession
  let requestedIp = req.ip.split(':')[3]
  let isBypass = true
  let bypassIps = [
    // 'example.com',
    '192\.168\.[0-9]{1,3}\.[0-9]{1,3}'
  ]
  bypassIps.forEach(ip => {
    ip = new RegExp(ip)
    if (ip.test(requestedIp)) isBypass = true
  })

  if (isAuthorised || isBypass) {
    /** Allow other pages to reference resources */
    // res.header('Access-Control-Allow-Origin', 'https://192.168.56.202')
    // res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

    next();
  }
  else
    res.render('login');
});

/** view engine */
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

app.post('/api/buys', require('./server/post-exp11-buys'))
app.post('/api/ints', require('./server/post-exp11-ints'))
app.post('/api/exts', require('./server/post-exp11-exts'))
app.post('/api/accs', require('./server/post-exp11-accs'))
app.post('/api/ents', require('./server/post-exp11-ents'))
app.post('/api/itms', require('./server/post-exp11-itms'))
app.post('/api/tfts', require('./server/post-exp11-tfts'))
app.put('/api/buys', require('./server/post-exp11-buys'))
app.put('/api/ints', require('./server/post-exp11-ints'))
app.put('/api/exts', require('./server/post-exp11-exts'))
app.put('/api/accs', require('./server/post-exp11-accs'))
app.put('/api/ents', require('./server/post-exp11-ents'))
app.put('/api/itms', require('./server/post-exp11-itms'))
app.put('/api/tfts', require('./server/post-exp11-tfts'))
app.put('/api/bals', require('./server/post-exp11-bals'))
app.delete('/api/itms', require('./server/delete-exp11-itms'))
app.delete('/', (require('./server/delete-all')))
app.get('', require('./server/page-exp11-buys'))
app.get('/das', require('./server/page-exp11-das'))
app.get('/buys/form/:id?', require('./server/page-exp11-buys_form'))
app.get('/buys', require('./server/page-exp11-buys'))
app.get('/bals/form/:week', require('./server/page-exp11-bals_form'))
app.get('/wcfs/:week?', require('./server/page-exp11-wcfs'))
app.get('/bals', require('./server/page-exp11-bals'))
app.get('/ints/form/:id?', require('./server/page-exp11-ints_form'))
app.get('/exts/form/:id?', require('./server/page-exp11-exts_form'))
app.get('/accs/form/:id?', require('./server/page-exp11-accs_form'))
app.get('/accs', require('./server/page-exp11-accs'))
app.get(/^\/(ents|tfts)\/?$/, require('./server/page-exp11-syns'))
app.get('/itms', require('./server/page-exp11-itms'))
app.get(/^\/(ents|itms|tfts)\/form(|\/[0-9]{0,10})\/?$/, require('./server/page-exp11-syns_form'))

app.get(/.*\.(css|jpg|js)$/, (req, res) => {
  let file = '/resources' + req.url
  if (!fs.existsSync(`${__dirname}${file}`)) {
    let splits = file.split('/')
    splits.splice(2, 1)
    file = splits.join('/')
  }
  res.sendFile(`${__dirname}${file}`)
})

/** USING HTTP */
var port = process.env.PORT_HTTP || 8080
app.listen(port, () => {
  console.log(`Listening on Port ${port}`)
})

/** HTTP redirect HTTPS */
// const http = require('http')
// var port1 = process.env.PORT_HTTP

// http.createServer(function(req, res) {
//   res.writeHead(301, {
//     Location: `https://${req.headers.host}${req.url}`
//   })
//   res.end()
// }).listen(port1, function() {
//  console.log(`Listening on Port ${port1}`)
// })

/** USING HTTPS */
var port2 = process.env.PORT_HTTPS
if (port2) {
  const credentials = {
    key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
    cert: fs.readFileSync(process.env.SSL_CRT, 'utf8')
  }
  const httpsServer = https.createServer(credentials, app)
  httpsServer.listen(port2, () => {
    console.log(`Listening on Port ${port2}`)
  })
}
