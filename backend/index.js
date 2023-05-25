const { Server } = require("socket.io");
const dotenv = require('dotenv');
dotenv.config()
const cors = require('cors');
const express = require('express');
const pgService = require('./services/pgService.js')
const crypto = require('crypto');
// const mgService = require('./mgService.js')
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('build'));

const io = new Server({
  cors: {
    origins: ["https://github.com", "http://localhost:3001"]
  }
});

io.on("connection", (socket) => {
  console.log("socket.io connected");
});

io.listen(3002);

let prefix
if (process.env.NODE_ENV === 'development') {
  prefix = process.env.DEVURL
} else {
  prefix = process.env.PRODURL
}

//get new uuid & insert to requestbin table
app.get('/createuuid', async (req, res) => {
  const uuid = crypto.randomUUID()
  try {
    const dbResponse = await pgService.insertUUID({ uuid: uuid })
    res.send(prefix + uuid);
  } catch (err) {
    res.send('Opps ' + err.message)
  }
})

//send body
app.post('/questbin/:uuid', async (req, res) => {
  console.log("received post");
  io.sockets.emit("new", req.params.uuid);
  const uuid = req.params.uuid;
  const requestData = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.originalUrl,
    query: req.query
  };

  try {
    const dbResponse = await pgService.insertRequestData({ uuid, requestData })
    res.sendStatus(200);
  } catch (err) {
    res.send('Opps ' + err.message)
  }
});

//get all uuid
app.get('/uuids', async (req, res) => {
  try {
    const dbResponse = await pgService.getAlluuids()
    res.send(dbResponse);
  } catch (err) {
    res.send('Opps ' + err.message)
  }
})

//get all data related to one uuid
app.get('/requests/:uuid', async (req, res) => {
  const uuid = req.params.uuid
  try {
    const dbResponse = await pgService.getUuidData(uuid)
    res.send(dbResponse);
  } catch (err) {
    res.send('Opps ' + err.message)
  }
})

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})