# IQLib Core

IQLib Core is a standalone server application.

# REST API
## Data Hierarchy
Default URL on development mode:
```sh
http://iqlib.herokuapp.com/
```
You will find available REST profiles for each Model's Repository

### Survey Area

As defined in [IQLib specification](../specification/datamodel.md) see section *Model for Survey Area* has the following structure:
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

```json
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
Let us create a new **Survey Area** called *East Hungary* with the following **URL**
```sh
curl -i -X POST -H "Content-Type:application/json" -d '{  "name" : "East Hungary",  "description" : "All data related to the eastern part of Hungary" }' http://iqlib.herokuapp.com/surveyarea
```
As a result, we will get the following JSON response from the server:
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
Let us add a new **DataSet** to existing **Survey Area**
