# IQLib Core

IQLib Core is a standalone server application.

# REST API
## Data Hierarchy
Default URL on development mode:
```sh
http://iqlib.herokuapp.com/
```
You will find available REST profiles for each Model's Repository:
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
curl -i -X POST -H "Content-Type:application/json" -d '{  "name" : "East Hungary",  "description" : "All data related to the eastern part of Hungary" }' http://localhost:8080/surveyarea
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
Let us search for newly created **Survey Area** object by it's unique name:
```sh
curl -i -X GET -H "Content-Type:application/json" http://iqlib.herokuapp.com/surveyarea/search/findByName?name=East%20Hungary
```
The result should be the same JSON response return after creating this object.

### Dataset
Let us add a new **DataSet** to existing **Survey Area**
