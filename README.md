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