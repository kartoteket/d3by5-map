# d3by5-map


## Options

### Basics
Option  | Type | Default | Desciption
------------- | -----|-------- | -----
width|Number|960
height|Number|500
aspectRatio|Number|500 / 960
margin|Number|20                 |for now single value
offSetX|Number|0                 |shifts the entire map horisointally in pixels
offSetY|Number|0                 |shifts the entire map veritcaly in pixels
showLabels|Boolean or String|0              |Bboolean or integer] false/0 = off, true/1 = on, 2 - 20 = zoomLevelTreshold
higlightOnHover|Boolean|false     |higlight country (or group of countries) on hover
showToolTipOn|String|'hover'     |[click, hover, none]
toolTipTemplate|Function|[See below]|A function that returns the markup four your tooltip.
assetsUrl|String|'/'       |base path to asset files
classPrefix|String|'d3x5_'|
debug|Boolean|false| Toggles debug messages (warning and such) to the console.


### Map
Option  | Type | Default | Desciption
------------- | -----|-------- | -----
geoData|object|{}              |topoJson (only for now)
projection|String|'geoMercator' |projection
scale|float|0.85                  |not quiter sure about this one
responsive|Boolean|false
graticule|Boolean|false          |graticules; a uniform grid of meridians and parallels for showing projection distortion
projectionFit|Boolean|true       |tries to fit the map inside container. Todo; rename ??


### Data Visualization
Option  | Type | Default | Desciption
------------- | -----|-------- | -----
data|object|{}                 |data to visualize
color|Function|null
texture|Function|null
colorKey|String|null
textureKey|String|null
countryIsoCodeMap|String|'properties.countryCode'  |If the topojson does not store the ISO code in  "geometries.id", use this to map the correct attribute (uses dot notation, eg "properties.countryCode")

### Zoom
Option  | Type | Default | Desciption
------------- | -----|-------- | -----
zoomMin|Number|1                 |min zoom level
zoomMax|Number|20                |max zoom level
zoomGestures|Boolean|true        |"Free zoom" (mouse scroll wheel, touch gestures)
zoomControls|Boolean|false        |toggle zoomButtons
zoomResetOnOceanClick|Boolean|false |reset zoom on background area click

### Colors

Option  | Type | Default | Desciption
------------- | -----|-------- | -----
baseColor|String|'#F8EBCB'
backgroundgColor|String|'none'   |'none' for transparent or #HEX
accentColor|String|'#FF6B6B'
borderColor|String|'#9DBFB1'


## Tool Tip Template

```
function(d, data) { 
	return '<h3 class="d3x5_tooltip__header">' + d.properties.name + '</h3>'; 
}
```


## Data Schema

### CSV
Must include one column referencing the country. This could be:
'id', 'countrycode', 'countryCode', 'country', 'Country', 'countryName', 'countryname'. Or it can be set as an option [1](#footnote-1)

#### Example
```
"country","id","immigration","emmigration","netmigration"
"Afghanistan","4","382365","4843117","-4460752"
"Albania","8","57616","1122910","-1065294"
"Algeria","12","242391","1763771","-1521380"
```

*Note*: Numeric Country codes are padded. So in the example above id 4 is read as 004.


### JSON array
You can present the data as an array of objects. Each object must include one property referencing the country. This could be: 'id', 'countrycode', 'countryCode', 'country', 'Country', 'countryName', 'countryname'. Or it can be set as an option [1](#footnote-1)

#### Example
```
[
	{
		id: "ABW",
		iso2Code: "AW",
		name: "Aruba",
		region: {
			id: "LCN",
			value: "Latin America & Caribbean "
			},
		adminregion: {
			id: "",
			value: ""
		},
		incomeLevel: {
			id: "HIC",
			value: "High income"
		},
		lendingType: {
			id: "LNX",
			value: "Not classified"
		},
		capitalCity: "Oranjestad",
		longitude: "-70.0167",
		latitude: "12.5167"
	},
	{
		id: "AFG",
		iso2Code: "AF",
		name: "Afghanistan",
		...
	}
	...
]
```



### JSON object
Countries group by iso-3166 country codes (alpha2, alpha3 of numeric). Optional porperties can be included and referenced in the options. Spesicifcally complex mapping of colors and/or textures.


#### Example
```
{
  "countries": {
    "ALB": {
      "groups": [
        "industry",
        "tradd"
      ],
      "fillColorMapKey": [
        "efta",
        "bits"
      ]
    },
    "BIH": {
      "groups": [
        "patents",
        "medicin"
      ],
      "fillColorMapKey": [
        "efta"
      ]
    },
    ...
}
```

[1]: See option


## On my Todo list
* Re-write in ES6
* Replace budo/browserify with better dev tooling
* Minify basic functionality and move extras to optional extensions / plugins. E.g textures and projections
* Move d3 out of bundle
* Remove lodash dependency
* Replace iso-3166-1 dependency


## Contribution
Please fork freely, submit pull requests bravely and raise issues friendly.


## Credits
All is dependent on [d3](https://d3js.org/) and [topojson](https://github.com/topojson/topojson). Additional projections uses [d3-geo-projection](https://github.com/d3/d3-geo-projection). Textures uses [textures.js] (https://riccardoscalco.github.io/textures/), country codes uses [iso-3166-1](https://github.com/ecrmnn/iso-3166-1). Inspired by [DataMaps](datamaps.github.io).


## Copyright and license
Code copyright 2017 Svale Fossåskaret / Kartoteket . Code released under [the MIT license](https://github.com/kartoteket/d3by5-map/blob/master/LICENSE).
