'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Dataset = require('../models/dataset');

const DatasetItems = module.context.collection('Dataset');
const keySchema = joi.string().required()
.description('The key of the dataset');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('dataset');


router.get(function (req, res) {
  res.send(DatasetItems.all());
}, 'list')
.response([Dataset], 'A list of DatasetItems.')
.summary('List all DatasetItems')
.description(dd`
  Retrieves a list of all DatasetItems.
`);


router.post(function (req, res) {
  const dataset = req.body;
  let meta;
  try {
    meta = DatasetItems.save(dataset);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(dataset, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: dataset._key})
  ));
  res.send(dataset);
}, 'create')
.body(Dataset, 'The dataset to create.')
.response(201, Dataset, 'The created dataset.')
.error(HTTP_CONFLICT, 'The dataset already exists.')
.summary('Create a new dataset')
.description(dd`
  Creates a new dataset from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let dataset
  try {
    dataset = DatasetItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(dataset);
}, 'detail')
.pathParam('key', keySchema)
.response(Dataset, 'The dataset.')
.summary('Fetch a dataset')
.description(dd`
  Retrieves a dataset by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const dataset = req.body;
  let meta;
  try {
    meta = DatasetItems.replace(key, dataset);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(dataset, meta);
  res.send(dataset);
}, 'replace')
.pathParam('key', keySchema)
.body(Dataset, 'The data to replace the dataset with.')
.response(Dataset, 'The new dataset.')
.summary('Replace a dataset')
.description(dd`
  Replaces an existing dataset with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let dataset;
  try {
    DatasetItems.update(key, patchData);
    dataset = DatasetItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(dataset);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the dataset with.'))
.response(Dataset, 'The updated dataset.')
.summary('Update a dataset')
.description(dd`
  Patches a dataset with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    DatasetItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a dataset')
.description(dd`
  Deletes a dataset from the database.
`);
