# d3by5-map


## Options

### Basic

### Advanced



## Data Schema

### CSV
Must include one column referencing the country. This could be:
'id', 'countrycode', 'countryCode', 'country', 'Country', 'countryName', 'countryname'. Or it can be set as an option [1](#footnote-1)

#### Example
```
"Country","FSI"
"Switzerland","1466.1",
"Hong Kong","1259.4",
"USA","1254.7",
```


### Json
Countries group by iso-3166 country codes (alpha2, alpha3 of numeric). Optional porperties can be included and referenced in the options. Spesicifcally complex mapping of colors and/or textures.


#### Example (skriv om til FSI exempel ?)
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
