# IQLib Core

IQLib Core is a standalone server application.

# REST API
## Data Hierarchy
Default URL on development mode:
```sh
http://iqlib.herokuapp.com/
```
You will find available REST profiles for each Model's Repository
```javascript
{
  "_links" : {
    "surveyarea" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea{?page,size,sort}",
      "templated" : true
    },
    "dataset" : {
      "href" : "http://iqlib.herokuapp.com/dataset{?page,size,sort}",
      "templated" : true
    },
    "datafile" : {
      "href" : "http://iqlib.herokuapp.com/files{?page,size,sort}",
      "templated" : true
    },
    "profile" : {
      "href" : "http://iqlib.herokuapp.com/profile"
    }
  }
}
```

### Survey Area

As defined in [IQLib specification](../specification/datamodel.md) see section *Model for Survey Area*:
<table>
  <tr>
    <td>Attribute</td>
    <td>Type</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>ID</td>
    <td>String</td>
    <td>Unique Identifier</td>
  </tr>
  <tr>
    <td>Name</td>
    <td>String</td>
    <td>Name of Survey Area</td>
  </tr>
  <tr>
    <td>List<Dataset></td>
    <td>List</td>
    <td>List of dataset related to Survey Area.</td>
  </tr>
  <tr>
    <td>Description</td>
    <td>Text</td>
    <td>Short summary on data files, their formats and equipments or carriers used to produce data files.</td>
  </tr>
</table>

Let us create a new **Survey Area** called *East Hungary* with the following **URL**
```sh
curl -i -X POST -H "Content-Type:application/json" -d '{  "name" : "East Hungary",  "description" : "All data related to the eastern part of Hungary" }' http://iqlib.herokuapp.com/surveyarea
```
As a result, we will get the following JSON response from the server containing the following information:
1. link to the survey area *http://iqlib.herokuapp.com/surveyarea/1* 
2. link to datasets related to this survey area *http://iqlib.herokuapp.com/surveyarea/1/datasets*
```json
{
  "name" : "East Hungary",
  "description" : "All data related to the eastern part of Hungary",
  "dataset" : null,
  "_links" : {
    "self" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/1"
    },
    "surveyArea" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/1"
    },
    "datasets" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/1/datasets"
    }
  }
}
```
To list the available **Search** methods for *Survey Area* model, we simply have to query:

```sh
curl -i -X GET -H "Content-Type:application/json" http://iqlib.herokuapp.com/surveyarea/search
```
The result will be a JSON object:
```json
{
  "_links" : {
    "findByNameQuery" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/search/findByNameQuery{?name}",
      "templated" : true
    },
    "findByName" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/search/findByName{?name}",
      "templated" : true
    },
    "findByDescription" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/search/findByDescription{?content}",
      "templated" : true
    },
    "self" : {
      "href" : "http://iqlib.herokuapp.com/surveyarea/search"
    }
  }
}
```

Let us search for newly created **Survey Area** object by it's unique name with *findByName*:
```sh
curl -i -X GET -H "Content-Type:application/json" http://iqlib.herokuapp.com/surveyarea/search/findByName?name=East%20Hungary
```

You may also search for substring of a name or description with the following methods *findByNameQuery* and *findByDescription*:

```sh
curl -i -X GET -H "Content-Type:application/json" http://iqlib.herokuapp.com/surveyarea/search/findByNameQuery?name=East
```

```sh
curl -i -X GET -H "Content-Type:application/json" http://iqlib.herokuapp.com/surveyarea/search/findByDescription?content=eastern
```

The result should be the same JSON response return after creating this object.


### Dataset
As defined in [IQLib specification](../specification/datamodel.md) see section *Model for Dataset*:

<table>
  <tr>
    <td>Attribute</td>
    <td>Type</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>ID</td>
    <td>String</td>
    <td>Unique Identifier</td>
  </tr>
  <tr>
    <td>List<DataFile></td>
    <td>List</td>
    <td>Data files related to this dataset.</td>
  </tr>
  <tr>
    <td>List<Tiling></td>
    <td>List</td>
    <td>Tilings created from current dataset. It is useful to identify if an already existing tiling is compatible with the processing algorithm.</td>
  </tr>
  <tr>
    <td>IsNonOverlapping</td>
    <td>Boolean</td>
    <td>TRUE if the dataset is made of non-overlapping Data Files; FALSE otherwise.</td>
  </tr>
  <tr>
    <td>Source</td>
    <td>String</td>
    <td>Origin of data (how the data was produced, not the physical location of data files related to it)</td>
  </tr>
  <tr>
    <td>Purpose</td>
    <td>String</td>
    <td>Logical relation between data files belonging to this dataset.</td>
  </tr>
  <tr>
    <td>Owner</td>
    <td>String</td>
    <td>Institute or data owner.</td>
  </tr>
</table>

Let us add a new **DataSet** to an existing **Survey Area**:
```json
curl -i -X POST -H "Content-Type:application/json" -d '{ "name": "SPOT5-2015-december", "source": "TERRAIN satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },' http://localhost:23700/datamodel/dataset?survey=1
```
Response from the server will contain the object itself with newly assigned **id** value:
```json
{
  "name":"SPOT5-2015-december",
  "source":"TERRAIN satellite",
  "purpose":"Water Logging",
  "owner":"FÖMI",
  "datafiles":null,
  "nonOverLapping":true,
  "id":6
}
```

What if we would like to add multiple dataset at the same time to a given *Survey Area*. This can also be done very easily by using the following method **http://localhost:23700/datamodel/datasets**, where in the request body we simply add a list of dataset JSON objects:

```json
curl -i -X POST -H "Content-Type:application/json" -d '
[
{ "name": "SPOT5-january", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-feburary", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-march", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-april", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-may", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-may", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-june", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" },
{ "name": "SPOT5-july", "source": "AQUA satellite", "purpose": "Water Logging", "owner": "FÖMI", "isNonOverLapping": "true" }
]' http://localhost:23700/datamodel/datasets?survey=1
```

The response will contain newly created objects with assigned IDs:

```json
[
    {
        "name":"SPOT5-may",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":9
    },
    {
        "name":"SPOT5-feburary",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":10
    },
    {
        "name":"SPOT5-june",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":13
    },
    {
        "name":"SPOT5-may",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":8
    },
    {
        "name":"SPOT5-july",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":14
    },
    {
        "name":"SPOT5-january",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":7
    },
    {
        "name":"SPOT5-march",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":11
    },
    {
        "name":"SPOT5-april",
        "source":"AQUA satellite",
        "purpose":"Water Logging",
        "owner":"FÖMI",
        "datafiles":null,
        "nonOverLapping":true,
        "id":12
    }
]
```

Let's check, if *survey area* of East Hungary contains the given datasets by querying for it:
```sh
curl -i -X GET -H "Content-Type:application/json" http://localhost:23700/surveyarea/1/datasets
```