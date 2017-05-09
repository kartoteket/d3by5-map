var d3 = require('d3');
var colorBrewer = require('d3-scale-chromatic');
var _ = require('lodash');
var Map = require('../../d3by5-map');

// demo map dimensions
var width = document.getElementsByClassName('wrapper')[0].offsetWidth;
var height = 400;

// load data
d3.queue()
  .defer(d3.json, '/demo/data/world-topo.json')      // our geometries
  .defer(d3.json, '/demo/data/demo-data.json')       // our demo data
  .defer(d3.json, '/demo/data/demo-data-map3.json')       // our demo data
  .defer(d3.csv, '/demo/data/FSI-top10-2015.csv')    // demo data fsi
  .await(loadMap);

// init when ready
function loadMap(error, world, demoData, demoData3, fsi) {

    if (error) throw error;

    var colors = d3.scaleOrdinal()
      .domain(_.map(_.filter(demoData.groups, ['type', 'treatise']), 'name'))
      // .domain(['NOR', 'EGY', 'RUS'])
      .range(['#F4CD2E', '#E16E51', '#4292A1']);

    var textures = d3.scaleOrdinal()
      .domain(_.map(_.filter(demoData.groups, ['type', 'treatise']), 'name'))
      .range(['paths', 'lines', 'circles']);

    var fsiColors;
    var min = d3.min(fsi, function(d) { return (+d.FSI);} );
    var max = d3.max(fsi, function(d) { return (+d.FSI);} );
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

    var fsiData = {
      values : fsi
    };

  map1 = new Map()
    .width(width)
    .height(height)
    .data(fsiData)
    .geoData(world)
    .color(fsiColors)
    .colorKey('properties.FSI')
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .toolTipTemplate(fsiToolTipTemplate)
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
    .color(colors)                            // scale mapping property to color
    .texture(textures)                        // scale mapping property to texture
    .colorKey('properties.fillColorMapKey')
    .textureKey('properties.texturesMapKey')
    // .responsive(true)
    .countryIsoCodeMap('properties.countryCode')
    .projection('geoWinkel3')  // .geoWinkel3 // d3.geoCylindricalEqualArea  // d3.geoMercator    //d3.geoEquirectangular
    // .projectionFit(false)
    .showToolTipOn('click')
    .assetsUrl('demo/')
    .backgroundgColor('#6C7C7C')
    .zoomControls(true)
    .zoomGestures(true)
    .showLabels(2)
  ;

  map3 = new Map()
    .width(width)
    .height(height)
    .data({values: demoData3})
    .geoData(world)
    .projection('geoAzimuthalEqualArea')
    .color(colors)
    .colorKey('properties.fillColorMapKey')
    .showLabels(3)
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .backgroundgColor('#6C7C7C')
    ;

  map4 = new Map()
    .width(width)
    .height(height)
    .data({values: demoData3})
    .geoData(world)
    .projection('geoEckert4')
    .color(colors)
    // .texture(textures)
    .zoomResetOnOceanClick(true)
    .showToolTipOn(false)
    .backgroundgColor('#006994')
    ;


   // call on elm
   d3.select('#map1').call(_.bind(map1.init, map1));
   d3.select('#map2').call(_.bind(map2.init, map2));
   d3.select('#map3').call(_.bind(map3.init, map3));
   // d3.select('#map4').call(_.bind(map4.init, map4));

}
