# IQLib specification
> Objectives and data model

# Introduction

## Objectives

Main goal is to allow an actor (human or machine code) to organize huge data sets describing geographical survey areas. IQLib supports the creation of semantic data aggregations within large data sets, and can be used to overcome scalability limitations of processing algorithms.

IQLib’s core functionality is the creation of a [Tiling](#tiling) of large datasets. Such a Tiling can either have a meaning (i.e. a set of watersheds) or simply be a support to enable data processing. In the latter case, processing algorithms can work on smaller [patches](#patches).

Broadly speaking, a Tiling is the decomposition of a survey area in which data points are either associated to polygons (regular or irregular), or grouped according to temporal attributes, or grouped into equally sized chunks, or a mixture of the above

## Features

If distributed processing nodes are available, IQLib should enable their exploitation.

IQLib should provide the functionality to stitching the output data files into a single large file. However this is an optional feature provided by IQLib with very low level priority.

The system should be extendible, where third party users could extend the functionalities on their demand.

## Supported data types

### Triangular Meshes

### Point clouds data

### Raster data

Regarding raster data, the Tiling procedure contains spatial partitioning and logical grouping of Tiles. For every dataset we may have different grouping logics, for example grouping Tiles by their temporal attributes. These are the main procedures, optionally, we may (re)distribute Tiles across processing nodes if available, otherwise we are processing them locally.

# Terminology

Data types are the following: point clouds, triangular meshes and Raster data. Data partitioning focuses on processing data in distributed model. Section processing level will introduce distributed processing in more detail.

## Data access patterns

Currently specification supports 4 different types of data access patterns based on cell configuration for [Map Algebra](http://gisgeography.com/map-algebra-global-zonal-focal-local/). 

1. Local operation. The value generated in the output raster is a function of cell values at the **_same location_** in the input layers. When you take the temperature average in each cell using two raster grids, this is an example of a local operation.
![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_0.png)
2. Global operation. A global operation is a process or function that is performed on each output cell using **_all of the cells._**
![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_1.png)
3. Focal operation. The focal operation is a spatial function that computes an output value of each cell using **_neighborhood values_**. Convolution, kernel and moving windows are examples of image processing techniques that use focal operations. A moving window is a rectangular arrangement of cells that applies an operation to each cell in a raster dataset while shifting in position entirely.
![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_2.png)
4. Zonal operation. A zonal operation is a spatial function that computes an output value of each cell using the **_zone containing that cell_**. An example of a zone could be a watershed. When you want to calculate the total mean volume of precipitation in each watershed zone, this is an example of when you would use a zonal operation.
![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_3.png)

## Patches

### Tile

A single read-write connected area of the original dataset. The collection of all the tiles that are not overlapping.

### Buffer zone

A collection of data around a tile, which can be used in read-only mode by a processing algorithm to edit/process the tile (under processing) related to this buffer zone. A buffer zone can be empty, when processing algorithm do not require any surrounding data around the Tile (eg. the service algorithm has a local data access pattern).

### <a name="patches"></a>Patch

A Patch may contain two components: a Tile and related Buffer Zone depending on Tiling algorithm. As defined in Buffer Zone, there are some cases where we do not need Buffer Zones, therefore a "Simple" Patch has a Tile, where a “Compound” Patch contains a Tile and a Buffer Zone. 

### Tile graph (TG)

All the tiles are represented as a graph, with edges encoding their geometrical adjacency.

As shown by this figure: Tile E is represented by red area, the buffer zone around Tile E is represented by the blue area surrounding the red area. Together the red and blue area represents the Patch, the following, the following, the following.

## <a name="tiling"></a> Tiling algorithm

A tiling algorithm is the process to construct Patches, where each Patch contains a Tile and a BufferZone. The tiling algorithm itself, may exploit knowledge of the partial structuring of the point cloud (if one is known).

Depending on our Tiling purpose, the different information should be stored as described below:

Gather all points I need to run a service on a single core. All files and their content are accessed through dataset.

Distribute Patches on different nodes for processing algorithms, meaning that we are splitting the input dataset(s) for "embarrassing parallel services".

To sum up, a Tiling algorithm calculates the tiles and related bufferzones. On the procedural aspect, we have three basic sequential levels:

1. Geometrical partition 

2. Creation of tiles 

3. Creation of patches 

The tiling algorithm can include all or part of the steps. Ususally a Tiling algorithm takes three input parameters, namely dataset(s) - where we take the data files from, data access pattern and domain decomposition method - where the geometry of the tiles is given explicitly or additional parameters are provided to help the Tiling algorithm to compute a decomposition.

### Geometrical partition

Spatio-temporal subdivision of the survey area, could be given as input for geometrical partitioning.

### Creation of Tiles

In the process of Tiling, new files can be created, depending on the Tiling algorithm applied. Newly created files represents Tiles and/or related indexes.

### Creation of Patches

Creation of patches usually means creation of bufferzones, but this only applies to Compound Patches, Simple Patches contains only a Tile.

## Stitching algorithm

We check that the processing algorithm has successfully finished processing on all the patches. For each patch a corresponding output file have been created. Stitching algorithm should take these output files and organize them into a new dataset with NonOverlapping data files. 

IQLib does not contain Stitching algorithms by default, therefore processing algorithm developers should be responsible for implementing their own stitching algorithm for their own output domain.

# Partitioning data model

## Organizing level

A Survey Area **has** at least one dataset, depending on processing requests. Each dataset **has at least one** data file, which may vary from size to format.

Constraints:

1. Each Survey Area must have at least one dataset, otherwise it’s invalid.

2. Each Dataset must have at least one datafile.

![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_4.png)

The basic data model for Survey area, Dataset and Data file are:

### Model for Survey Area

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


Example

As an example for Eastern survey area of hungary containing SPOT5 satellite images and Shapefiles could be defined as:

<table>
  <tr>
    <td>[‘Eastern Hungary Flood detection’, [‘GeoTiff DS’, ‘Shp DS’], ’Data b/w January-June 2015’]</td>
  </tr>
</table>


Example

![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_5.png)

<table>
  <tr>
    <td>[‘Regione Liguria’, [‘Elevation Dataset’, ‘Railfall dataset’], ‘Spring data acquired by …’]</td>
  </tr>
</table>


### Model for Dataset

A Survey area might have more than one dataset, where a dataset represents logically related data files. Each dataset may have a huge list of data files, however not all the data files will be used for a service, usually just a subset of data files is necessary.

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


**Note **

A dataset containing non-overlapping data files can be processed by corresponding algorithms immediately without Tiling.

**Note**

A Dataset contains a List of Tiling because processing algorithms look for available dataset, not available Tilings. The list of Tiling will return all available Tilings related to the Dataset.

Following the example above for Eastern Hungary Flood detection survey, we have a dataset, containing SPOT5 satellite images. These files have been assembled with one purpose, to detect flooded areas in Eastern Hungary. This can be defined as:

<table>
  <tr>
    <td>GeoTIFF DS: [[‘f1.tiff’, ‘f2.tiff’, ‘f3.tiff’, …], ‘SPOT5’, ‘Flood detection’, ‘FÖMI’]</td>
  </tr>
</table>


### Model for Data File

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
    <td>Format</td>
    <td>String</td>
    <td>Specific File format.</td>
  </tr>
  <tr>
    <td>URI</td>
    <td>String</td>
    <td>Current Location of data file.</td>
  </tr>
  <tr>
    <td>State</td>
    <td>Enumerate</td>
    <td>RAW, PROCESSED, TILED, BUFFERZONE</td>
  </tr>
  <tr>
    <td>Lineage</td>
    <td>Text</td>
    <td>description of the processing pipeline that produced this file (grid re-tiling, subsampling or a combination of that…), including its possible input and processing parameters</td>
  </tr>
  <tr>
    <td>Geonetworks Metadata</td>
    <td>Text</td>
    <td>(Optional) additional metadata used in IQmulus</td>
  </tr>
</table>


The type states whether the file relates to a raw dataset (i.e. original data), to a processed dataset (e.g. after noise reduction), to a tile, or a bufferzone. Input raw datafiles have an empty lineage (or the specification of the acquisition only). After a tiling algorithm, the lineage is updated to advertize this (re)tiling and its parameter and the tiles have the TILED state. If bufferzones are produced for some data access pattern, there type is set to BUFFERZONE.

Likewise further processing set the type similarly and advertise their lineage recursively.

## Data Access Pattern level

### Definition of file file types

<table>
  <tr>
    <td>Abbrev</td>
    <td>Type</td>
    <td>Topology</td>
    <td>Geometry</td>
    <td>Other point attributes</td>
  </tr>
  <tr>
    <td>M</td>
    <td>Mesh</td>
    <td>Explicit</td>
    <td>Explicit 3D </td>
    <td>Explicit (eg: color, normal…)</td>
  </tr>
  <tr>
    <td>P</td>
    <td>Point cloud</td>
    <td>Implicit 1D 
file order</td>
    <td>Explicit 3D</td>
    <td>Explicit (eg: time, sensor position, normal, color, classification…)</td>
  </tr>
  <tr>
    <td>R</td>
    <td>Raster</td>
    <td>Implicit 2D pixel grid</td>
    <td>Implicit 2D (from pixel coordinates and metadata)</td>
    <td>Explicit (image channels : z, color, classification…)</td>
  </tr>
</table>


### Definition of Access Patterns

<table>
  <tr>
    <td>Category</td>
    <td>Abbrev</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>Local</td>
    <td>L</td>
    <td>independent</td>
  </tr>
  <tr>
    <td>Focal</td>
    <td>F</td>
    <td>topological neighborhood</td>
  </tr>
  <tr>
    <td>Zonal</td>
    <td>Z</td>
    <td>coordinate neighborhood</td>
  </tr>
  <tr>
    <td>Zonal and Focal</td>
    <td>ZF</td>
    <td>combination of topological and coordinate neighborhood</td>
  </tr>
  <tr>
    <td>Global</td>
    <td>G</td>
    <td></td>
  </tr>
</table>


### Description on DAP and File types

<table>
  <tr>
    <td>Category</td>
    <td>Datatype</td>
    <td>Subtype</td>
    <td>Description</td>
    <td>SQL equiv</td>
  </tr>
  <tr>
    <td>L</td>
    <td>MPR</td>
    <td>-</td>
    <td>Each sample is processed independently</td>
    <td>standard, no grouping</td>
  </tr>
  <tr>
    <td>F
</td>
    <td>P</td>
    <td>M preceding
Datatype
MPR
P
M
R

P
PMR
PMR



N following</td>
    <td>requires read access to the M preceding and N following samples, as ordered in the datafile (eg constant memory stream processing)</td>
    <td>ROW WINDOW</td>
  </tr>
  <tr>
    <td></td>
    <td>M</td>
    <td>N-ring</td>
    <td>requires access to the vertex attributes within a given edge-distance N</td>
    <td>None</td>
  </tr>
  <tr>
    <td></td>
    <td>R</td>
    <td>NxN raster window</td>
    <td>squared centered window in raster for eg convolutions</td>
    <td>None</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td>...</td>
    <td>...</td>
    <td></td>
  </tr>
  <tr>
    <td>Z

</td>
    <td>P</td>
    <td>1D moving range </td>
    <td>requires all data within a given 1D range around one coordinate of the output vertex, (eg: [t-dt,t+dt] time frame)</td>
    <td>RANGE WINDOW</td>
  </tr>
  <tr>
    <td></td>
    <td>PMR</td>
    <td>ND moving range</td>
    <td>requires all data within a given a more general range around the output vertex, (eg: 1m spherical neighborhood)</td>
    <td>None</td>
  </tr>
  <tr>
    <td></td>
    <td>PMR</td>
    <td>partition by attribute</td>
    <td>requires all vertices within an identical attribute</td>
    <td>GROUP BY or 
PARTITION BY
</td>
  </tr>
  <tr>
    <td></td>
    <td></td>
    <td>...</td>
    <td>...</td>
    <td></td>
  </tr>
  <tr>
    <td>ZF

</td>
    <td></td>
    <td>?</td>
    <td>?watershed, region growing</td>
    <td></td>
  </tr>
  <tr>
    <td>G</td>
    <td></td>
    <td></td>
    <td>Not much hope for this one, it’d better only see small data. Produces the trivial tiling with a single tile containing everything</td>
    <td>AGGREGATES</td>
  </tr>
</table>


## Indexing level

## Tiling level

Before processing a dataset distributedly we have to verify if the Dataset is properly tiled (i.e. an appropriate tiling exists for that dataset). If not, we must produce it.

![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_6.png)

Some services can act on more than one Dataset at once. In these cases a compatible tiling is required over all the Datasets used. Therefore, the tiling algorithm must take possible tiling constraints into account.

![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_7.png)

### Model for Tile

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
    <td>List<Tile> neighbors</td>
    <td>List</td>
    <td>List of all adjacency neighbors of current tile.</td>
  </tr>
  <tr>
    <td>List<DataFile></td>
    <td>List</td>
    <td>List of data files created this Tile. </td>
  </tr>
  <tr>
    <td>List<Indexes> of datafiles</td>
    <td>List</td>
    <td>This is not used if data files represent this tile only.</td>
  </tr>
  <tr>
    <td>Geometry</td>
    <td>WKT
GeoJSON</td>
    <td>Data representing the spatial area (eg. Bounding Box, polygonal boundary of the tile)</td>
  </tr>
</table>


Geometry attribute represents the spatial area of current Tile. 

Topological relation between Tiles is not that relevant at current state, because each Patch contains a Tile and related Buffer Zone.

### Model for Buffer Zone

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
    <td>Tile</td>
    <td>String</td>
    <td>Unique identifier to the Tile related to this Buffer zone.</td>
  </tr>
  <tr>
    <td>List<DataFile></td>
    <td>List</td>
    <td>List of data files created this Buffer zone.</td>
  </tr>
  <tr>
    <td>List<Indexes> of datafiles</td>
    <td>List</td>
    <td>Index files to all related files created this buffer zone.</td>
  </tr>
</table>


### Model for Patch

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
    <td>Tile</td>
    <td>String</td>
    <td>Unique identifier of Tile object related to this Patch</td>
  </tr>
  <tr>
    <td>BufferZone</td>
    <td>String</td>
    <td>Unique identifier of BufferZone object related to this Patch</td>
  </tr>
  <tr>
    <td>Overhead
Indicator</td>
    <td>Float</td>
    <td>A number defined by (physical size Patch)/(physical size Tile).</td>
  </tr>
</table>


Different patches can share a common tile while having different buffer zones. If the same set of tiles needs to be used by two services which require different DAPs, then two tilings need to be created over the same set of tiles.

An overhead indicator becomes useful, when actors want to scale up their processing algorithm. Based on the indicator, actors may choose the best trade off between efficiency over storage requirement.

### Model for Tiling

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
    <td>List<Patch></td>
    <td>List</td>
    <td>List of Patches created by tiling process</td>
  </tr>
  <tr>
    <td>List<Dataset></td>
    <td>List</td>
    <td>Tiling is performed on list of dataset.</td>
  </tr>
  <tr>
    <td>dap</td>
    <td>DAP</td>
    <td>Data access pattern</td>
  </tr>
</table>


A Tiling is a collection of Patches over one or more Datasets. Each Patch contains a Tile and a BufferZone. Each Tile is made of a collection of subsets of Data files in one of the Datasets. The same applies to BufferZones. Each Tiling is characterized by a Data Access Pattern.

![image alt text](https://raw.githubusercontent.com/posseidon/IQLib/master/docs/img/image_8.png)

To represent a Tiling, new Data files can be created to encode the Tiles and Bufferzones. However these files are logically not connected to the original DataSet, due to the fact that they have been created and modified according to Tiling algorithm. Alternatively, Tile and Bufferzones can refer to the original Data Files and use proper indices to specify which parts of such datafiles constitute them. 

