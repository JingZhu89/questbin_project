const pgp = require('pg-promise')();
const db = pgp(`postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@localhost:5432/questbin_project`);

db.connect()
    .then(obj => {
        console.log("connected to postgres")
        obj.done();
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
});

//data object {urlParams}
const insertUUID = async (data) => {
  return await db.none('INSERT INTO requestbin (uuid) VALUES(${uuid})', {
    uuid: data.uuid
  });
}

//data object {uuid, request_body}
const insertRequestBody = async (data) => {
  const id = await getRequestbinID(data.uuid)
  return await db.none('INSERT INTO request (requestbin_id, request_body) VALUES(${requestbin_id}, ${request_body})', {
    requestbin_id: id,
    request_body: data.request_body
  }) 
}

//get all uuids in requestbin
const getAlluuids = async () => {
  return await db.many('SELECT uuid FROM requestbin');
}

const getUuidData = async (uuid) => {
  return await db.many('SELECT request_body FROM request r LEFT OUTER JOIN requestbin rb ' + 
    'ON r.requestbin_id = rb.id ' + 
    'WHERE rb.uuid = $1', uuid);
}

const getRequestbinID = async (uuid) => {
  const response = await db.one('SELECT id FROM requestbin WHERE uuid = ${uuid}', {uuid : uuid});
  return response.id
}

module.exports = {insertUUID, getAlluuids, getUuidData, insertRequestBody}