var d3 = require('d3');
var _ = require('lodash');
var Map = require('../../d3by5-map');

// load data
d3.queue()
  .defer(d3.json, '/demo/data/world-topo.json')      // our geometries
  .defer(d3.json, '/demo/data/demo-data.json')      // our geometries
  .await(loadMap);

// init when ready
function loadMap(error, world, demoData) {

    if (error) throw error;

    var colors = d3.scaleOrdinal()
      .domain(_.map(_.filter(demoData.groups, ['type', 'treatise']), 'name'))
      // .domain(['NOR', 'EGY', 'RUS'])
      .range(['#F4CD2E', '#E16E51', '#4292A1']);

    var textures = d3.scaleOrdinal()
      .domain(_.map(_.filter(demoData.groups, ['type', 'treatise']), 'name'))
      .range(['paths', 'lines', 'circles']);

    // data
    var data = {
      title: "Demo map",
      schema : [
      {
        "type"   : "CountryCode",
        "color"  : 'red'
      }
      ],
      values : demoData
    };

 // init map module
  map1 = new Map()
    .data(data)
    .geoData(world)
    .margin(10)
    .higlightOnHover(true)
    // .offSetX(-50)
    // .offSetY(-10)
    .zoomMax(10)
    .color(colors)           // scale mapping property to color
    .texture(textures)       // scale mappng property to texture
    .responsive(true)
    .countryIsoCodeMap('properties.countryCode')
    .projection('geoWinkel3')  // .geoWinkel3 // d3.geoCylindricalEqualArea  // d3.geoMercator    //d3.geoEquirectangular
    .showToolTipOn('click')
    .assetsUrl('demo/')
    .backgroundgColor('#ddd')


    // .toolTipTemplate(toolTipTemplate)
  ;

  map2 = new Map()
    .data(data)
    .geoData(world)
    .color(colors)           // scale mapping property to color
    // .classPrefix('map2')
    // .margin(10)
    // .zoomMax(10)
    // // .texture(textures)       // scale mappng property to texture
    // .responsive(true)
    // .countryIsoCodeMap('properties.countryCode')
    // .projection('geoWinkel3')  // .geoWinkel3 // d3.geoCylindricalEqualArea  // d3.geoMercator    //d3.geoEquirectangular
    // .showToolTipOn('hover')
    // .assetsUrl('demo/')
    // .backgroundgColor('#ddd')

;



   // call on elm
   d3.select('#map1').call(_.bind(map1.init, map1));
   d3.select('#map2').call(_.bind(map2.init, map2));
   // d3.select('#map3').call(_.bind(map.init, map));
   // d3.select('#map4').call(_.bind(map.init, map));

}
