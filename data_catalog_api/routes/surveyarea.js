'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const SurveyArea = require('../models/surveyarea');

const SurveyAreaItems = module.context.collection('SurveyArea');
const keySchema = joi.string().required()
.description('The key of the surveyArea');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('surveyArea');


router.get(function (req, res) {
  res.send(SurveyAreaItems.all());
}, 'list')
.response([SurveyArea], 'A list of SurveyAreaItems.')
.summary('List all SurveyAreaItems')
.description(dd`
  Retrieves a list of all SurveyAreaItems.
`);


router.post(function (req, res) {
  const surveyArea = req.body;
  let meta;
  try {
    meta = SurveyAreaItems.save(surveyArea);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(surveyArea, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: surveyArea._key})
  ));
  res.send(surveyArea);
}, 'create')
.body(SurveyArea, 'The surveyArea to create.')
.response(201, SurveyArea, 'The created surveyArea.')
.error(HTTP_CONFLICT, 'The surveyArea already exists.')
.summary('Create a new surveyArea')
.description(dd`
  Creates a new surveyArea from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let surveyArea
  try {
    surveyArea = SurveyAreaItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(surveyArea);
}, 'detail')
.pathParam('key', keySchema)
.response(SurveyArea, 'The surveyArea.')
.summary('Fetch a surveyArea')
.description(dd`
  Retrieves a surveyArea by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const surveyArea = req.body;
  let meta;
  try {
    meta = SurveyAreaItems.replace(key, surveyArea);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(surveyArea, meta);
  res.send(surveyArea);
}, 'replace')
.pathParam('key', keySchema)
.body(SurveyArea, 'The data to replace the surveyArea with.')
.response(SurveyArea, 'The new surveyArea.')
.summary('Replace a surveyArea')
.description(dd`
  Replaces an existing surveyArea with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let surveyArea;
  try {
    SurveyAreaItems.update(key, patchData);
    surveyArea = SurveyAreaItems.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(surveyArea);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the surveyArea with.'))
.response(SurveyArea, 'The updated surveyArea.')
.summary('Update a surveyArea')
.description(dd`
  Patches a surveyArea with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    SurveyAreaItems.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a surveyArea')
.description(dd`
  Deletes a surveyArea from the database.
`);
