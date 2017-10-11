'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Contain = require('../models/contain');

const contains = module.context.collection('contains');
const keySchema = joi.string().required()
.description('The key of the contain');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('contain');


const NewContain = Object.assign({}, Contain, {
  schema: Object.assign({}, Contain.schema, {
    _from: joi.string(),
    _to: joi.string()
  })
});


router.get(function (req, res) {
  res.send(contains.all());
}, 'list')
.response([Contain], 'A list of contains.')
.summary('List all contains')
.description(dd`
  Retrieves a list of all contains.
`);


router.post(function (req, res) {
  const contain = req.body;
  let meta;
  try {
    meta = contains.save(contain._from, contain._to, contain);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(contain, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: contain._key})
  ));
  res.send(contain);
}, 'create')
.body(NewContain, 'The contain to create.')
.response(201, Contain, 'The created contain.')
.error(HTTP_CONFLICT, 'The contain already exists.')
.summary('Create a new contain')
.description(dd`
  Creates a new contain from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let contain
  try {
    contain = contains.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(contain);
}, 'detail')
.pathParam('key', keySchema)
.response(Contain, 'The contain.')
.summary('Fetch a contain')
.description(dd`
  Retrieves a contain by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const contain = req.body;
  let meta;
  try {
    meta = contains.replace(key, contain);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(contain, meta);
  res.send(contain);
}, 'replace')
.pathParam('key', keySchema)
.body(Contain, 'The data to replace the contain with.')
.response(Contain, 'The new contain.')
.summary('Replace a contain')
.description(dd`
  Replaces an existing contain with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let contain;
  try {
    contains.update(key, patchData);
    contain = contains.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(contain);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the contain with.'))
.response(Contain, 'The updated contain.')
.summary('Update a contain')
.description(dd`
  Patches a contain with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    contains.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a contain')
.description(dd`
  Deletes a contain from the database.
`);
