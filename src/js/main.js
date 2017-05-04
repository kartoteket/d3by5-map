var d3 = require('d3');
var _ = require('lodash');
var Map = require('../../d3by5-map');

var width = document.getElementsByClassName('wrapper')[0].offsetWidth;
var height = 400;

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

  map1 = new Map()
    .width(width)
    .height(height)
    .data(data)
    .geoData(world)
    .color(colors)
    .zoomResetOnOceanClick(true)
    .showToolTipOn(false)
    .backgroundgColor('#006994')
    ;

  map2 = new Map()
    .width(width)
    .height(height)
    .data(data)
    .geoData(world)
    .margin(30)
    .higlightOnHover(true)
    // .offSetX(-150)
    // .offSetY(-10)
    .zoomMax(20)
    .color(colors)           // scale mapping property to color
    .texture(textures)       // scale mappng property to texture
    // .responsive(true)
    .countryIsoCodeMap('properties.countryCode')
    .projection('geoWinkel3')  // .geoWinkel3 // d3.geoCylindricalEqualArea  // d3.geoMercator    //d3.geoEquirectangular
    // .projectionFit(false)
    .showToolTipOn('click')
    .assetsUrl('demo/')
    .backgroundgColor('#6C7C7C')
    .zoomControls(true)
    .zoomGestures(true)
    .showLabels(true)
    // .toolTipTemplate(toolTipTemplate)
  ;

  map3 = new Map()
    .width(width)
    .height(height)
    .data(data)
    .geoData(world)
    .projection('geoAzimuthalEqualArea')
    .color(colors)
    .showLabels(3)
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .backgroundgColor('#6C7C7C')
    ;

  map4 = new Map()
    .width(width)
    .height(height)
    .data(data)
    .geoData(world)
    .projection('geoEckert4')
    .color(colors)
    .zoomResetOnOceanClick(true)
    .showToolTipOn(false)
    .backgroundgColor('#006994')
    ;


   // call on elm
   d3.select('#map1').call(_.bind(map1.init, map1));
   d3.select('#map2').call(_.bind(map2.init, map2));
   d3.select('#map3').call(_.bind(map3.init, map3));
   d3.select('#map4').call(_.bind(map4.init, map4));

}
