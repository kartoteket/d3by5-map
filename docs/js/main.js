// dependencies
var _           = require('lodash');
var d3          = require('d3');
var colorBrewer = require('d3-scale-chromatic');
var Map         = require('../../d3by5-map');

// demo map dimensions
var width       = document.getElementsByClassName('wrapper')[0].offsetWidth;
var height      = 400;

function mapExample1(world, data) {
    var fsiColors;
    var min = d3.min(data, function(d) { return (+d.FSI);} );
    var max = d3.max(data, function(d) { return (+d.FSI);} );
    // var mean = d3.mean(fsi, function(d) { return (+d.FSI);} );
    // var median = d3.median(fsi, function(d) { return (+d.FSI);} );
    // var extent = d3.extent(fsi, function(d) { return (+d.FSI);} );

    // fsiColors = d3.scaleSequential(colorBrewer.interpolateRdYlGn)
    fsiColors = d3.scaleThreshold();
    fsiColors.domain([0, min, 50, 100, 200, 400, 800, max]);
    fsiColors.range(colorBrewer.schemeRdYlGn[9].reverse());

    var fsiToolTipTemplate = function(d, data) {
      var tooltipHtml = ['<h3 class="d3x5_tooltip__header">', d.properties.name, '</h3>'];
      tooltipHtml =  _.concat(tooltipHtml, '<div class="d3x5_tooltip__content">');
      if (d.properties.FSI) {
        tooltipHtml =  _.concat(tooltipHtml, '<h4>FSI value: ', d.properties.FSI, '</h4>');
      }
      tooltipHtml =  _.concat(tooltipHtml, '</div>');
      return tooltipHtml.join('');
  };

  map1 = new Map()
    .width(width)
    .height(height)
    .data({values: data}) // TODO: Remove values
    .geoData(world)
    .color(fsiColors)
    .colorKey('properties.FSI')
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .toolTipTemplate(fsiToolTipTemplate)
    .backgroundgColor('#006994')
    ;
}

function mapExample2(world, data) {
  var colors = d3.scaleOrdinal()
    .domain(_.map(_.filter(data.groups, ['type', 'treatise']), 'name'))
    .range(['#F4CD2E', '#E16E51', '#4292A1']);

  var textures = d3.scaleOrdinal()
    .domain(_.map(_.filter(data.groups, ['type', 'treatise']), 'name'))
    .range(['paths', 'lines', 'circles']);

  // data
  var _data = {
    title: "Demo map",
    schema : [
    {
      "type"   : "CountryCode",
      "color"  : 'red'
    }
    ],
    values : data
  };

  map2 = new Map()
    .width(width)
    .height(height)
    .data(_data)
    .geoData(world)
    .margin(30)
    .higlightOnHover(true)
    // .offSetX(-150)
    // .offSetY(-10)
    .zoomMax(20)
    .color(colors)                            // scale mapping property to color
    .texture(textures)                        // scale mapping property to texture
    .colorKey('properties.fillColorMapKey')
    .textureKey('properties.texturesMapKey')
    // .responsive(true)
    .countryIsoCodeMap('properties.countryCode')
    .projection('geoWinkel3')  // .geoWinkel3 // d3.geoCylindricalEqualArea  // d3.geoMercator    //d3.geoEquirectangular
    // .projectionFit(false)
    .showToolTipOn('click')
    .assetsUrl('/docs/')
    .backgroundgColor('#6C7C7C')
    .zoomControls(true)
    .zoomGestures(true)
    .showLabels(2)
  ;
}

function mapExample3(world, data) {
  var colors = d3.scaleOrdinal()
    .domain(_.map(_.filter(data.groups, ['type', 'treatise']), 'name'))
    .range(['#F4CD2E', '#E16E51', '#4292A1']);

  map3 = new Map()
    .width(width)
    .height(height)
    .data({values: data})
    .geoData(world)
    .projection('geoAzimuthalEqualArea')
    // .color(colors)
    .colorKey('properties.fillColorMapKey')
    .showLabels(3)
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .backgroundgColor('#6C7C7C')
    ;
}

function mapExample4(world, data) {
  var colors = d3.scaleOrdinal()
    .domain(_.map(_.filter(data.groups, ['type', 'treatise']), 'name'))
    .range(['#F4CD2E', '#E16E51', '#4292A1']);

  map4 = new Map()
    .width(width)
    .height(height)
    .data({values: data})
    .geoData(world)
    .projection('geoEckert4')
    .color(colors)
    .colorKey('properties.fillColorMapKey')
    // .texture(textures)
    .zoomResetOnOceanClick(true)
    .showToolTipOn(false)
    .backgroundgColor('#006994')
    ;
}


// load data
d3.queue()
  .defer(d3.json, 'data/world-topo.json')      // our geometries
  .defer(d3.csv, 'data/FSI-top10-2015.csv')    // demo data fsi
  .defer(d3.json, 'data/demo-data.json')       // our demo data
  .defer(d3.json, 'data/demo-data-map3.json')  // our demo data
  .await(loadMaps);

// init when ready
function loadMaps(error, world, fsiData, tradeData, demoData3) {
    if (error) throw error;

    // setup 4 example maps
    mapExample1(world, fsiData);
    mapExample2(world, tradeData);
    mapExample3(world, demoData3);
    mapExample4(world, demoData3);

   // call on elm
   // TODO: Need to pick up unique elmidentifier in script
   d3.select('#map1').call(map1.init);
   d3.select('#map2').call(map2.init);
   d3.select('#map3').call(map3.init);
   d3.select('#map4').call(map4.init);

}
