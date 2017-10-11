'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Datafile = require('../models/datafile');

const DatafileItems = module.context.collection('Datafile');
const keySchema = joi.string().required()
.description('The key of the datafile');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('datafile');


router.get(function (req, res) {
  res.send(DatafileItems.all());
}, 'list')
.response([Datafile], 'A list of DatafileItems.')
.summary('List all DatafileItems')
.description(dd`
  Retrieves a list of all DatafileItems.
`);


router.post(function (req, res) {
  const datafile = req.body;
  let meta;
  try {
    meta = DatafileItems.save(datafile);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(datafile, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: datafile._key})
  ));
  res.send(datafile);
}, 'create')
.body(Datafile, 'The datafile to create.')
.response(201, Datafile, 'The created datafile.')
.error(HTTP_CONFLICT, 'The datafile already exists.')
.summary('Create a new datafile')
.description(dd`
  Creates a new datafile from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let datafile
  try {
    datafile = DatafileItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(datafile);
}, 'detail')
.pathParam('key', keySchema)
.response(Datafile, 'The datafile.')
.summary('Fetch a datafile')
.description(dd`
  Retrieves a datafile by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const datafile = req.body;
  let meta;
  try {
    meta = DatafileItems.replace(key, datafile);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(datafile, meta);
  res.send(datafile);
}, 'replace')
.pathParam('key', keySchema)
.body(Datafile, 'The data to replace the datafile with.')
.response(Datafile, 'The new datafile.')
.summary('Replace a datafile')
.description(dd`
  Replaces an existing datafile with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let datafile;
  try {
    DatafileItems.update(key, patchData);
    datafile = DatafileItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(datafile);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the datafile with.'))
.response(Datafile, 'The updated datafile.')
.summary('Update a datafile')
.description(dd`
  Patches a datafile with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    DatafileItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a datafile')
.description(dd`
  Deletes a datafile from the database.
`);
