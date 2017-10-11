'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Produce = require('../models/produce');

const produces = module.context.collection('produces');
const keySchema = joi.string().required()
.description('The key of the produce');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('produce');


const NewProduce = Object.assign({}, Produce, {
  schema: Object.assign({}, Produce.schema, {
    _from: joi.string(),
    _to: joi.string()
  })
});


router.get(function (req, res) {
  res.send(produces.all());
}, 'list')
.response([Produce], 'A list of produces.')
.summary('List all produces')
.description(dd`
  Retrieves a list of all produces.
`);


router.post(function (req, res) {
  const produce = req.body;
  let meta;
  try {
    meta = produces.save(produce._from, produce._to, produce);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(produce, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: produce._key})
  ));
  res.send(produce);
}, 'create')
.body(NewProduce, 'The produce to create.')
.response(201, Produce, 'The created produce.')
.error(HTTP_CONFLICT, 'The produce already exists.')
.summary('Create a new produce')
.description(dd`
  Creates a new produce from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let produce
  try {
    produce = produces.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(produce);
}, 'detail')
.pathParam('key', keySchema)
.response(Produce, 'The produce.')
.summary('Fetch a produce')
.description(dd`
  Retrieves a produce by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const produce = req.body;
  let meta;
  try {
    meta = produces.replace(key, produce);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(produce, meta);
  res.send(produce);
}, 'replace')
.pathParam('key', keySchema)
.body(Produce, 'The data to replace the produce with.')
.response(Produce, 'The new produce.')
.summary('Replace a produce')
.description(dd`
  Replaces an existing produce with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let produce;
  try {
    produces.update(key, patchData);
    produce = produces.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(produce);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the produce with.'))
.response(Produce, 'The updated produce.')
.summary('Update a produce')
.description(dd`
  Patches a produce with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    produces.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a produce')
.description(dd`
  Deletes a produce from the database.
`);
