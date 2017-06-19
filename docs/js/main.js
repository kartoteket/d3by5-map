// dependencies
var _           = require('lodash');
// var d3          = require('d3');
var colorBrewer = require('d3-scale-chromatic');
var Map         = require('../../d3by5-map');

// demo map dimensions
var width       = document.getElementsByClassName('wrapper')[0].offsetWidth;
var height      = 400;

function mapExample1(world, data) {
    var colors = d3.scaleQuantile();
    var min = d3.min(data, function(d) { return (+d.FSI);} );
    var max = d3.max(data, function(d) { return (+d.FSI);} );

    colors.domain([50, 100, 200, 400, 800, max]);
    colors.range(colorBrewer.schemeRdYlGn[7].reverse());

    var toolTipTemplate = function(d, data) {
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
    .color(colors)
    .colorKey('properties.FSI')
    .zoomResetOnOceanClick(true)
    .showToolTipOn('hover')
    .toolTipTemplate(toolTipTemplate)
    // .backgroundgColor('#006994')
    ;


    var prev = 0;
    var range;
    d3.select('.legend1')
      .style('color', '#fff')
      .selectAll('li')
      .data(colors.domain())
      .enter()
      .append('li')
      .text(function(d, i){
        if (i < 1) {
          range = '< - ' + d;
        } else if (i === colors.domain().length-1) {
          range = prev + ' - >';
        } else {
          range = prev + ' - ' + d;
        }
        prev = d;
        return range;
      })
      .append('span')
      .style('background-color', function(d){
        return colors(d);
      })
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
    // .backgroundgColor('#6C7C7C')
    .zoomControls(true)
    .zoomGestures(true)
    .showLabels(2)
  ;
}

function mapExample3(world, data) {

  // console.log(data);

  var min = d3.min(data, function(d) { return (+d.netmigration);} );
  var max = d3.max(data, function(d) { return (+d.netmigration);} );
  var q1 = d3.quantile((data, function(d) { return (+d.netmigration);}), 0.5 );
  var median = d3.median(data, function(d) { return (+d.netmigration);} );
  var variance = d3.variance(data, function(d) { return (+d.netmigration);} );
  var deviation = d3.deviation(data, function(d) { return (+d.netmigration);} );

  // var colors = d3.scaleLinear();
  // var colors = d3.scaleSequential(colorBrewer.interpolatePiYG)
  //   .domain([min, max]);

// var colors = d3.scaleLinear()
//   .domain([min, 0, 4460752, max])
//   .range(['red', '#e9a3c9', '#a1d76a', 'green']);

var colors = d3.scaleLinear()
    .domain([min, 0, max])
    .range(['rgb(175, 141, 195)', 'rgb(233,233,233)', 'rgb(127, 191, 123)'])

    var formatComma = d3.format(",");
    var toolTipTemplate = function(d, data) {
      var tooltipHtml = ['<h3 class="d3x5_tooltip__header">', d.properties.name, '</h3>'];
      tooltipHtml =  _.concat(tooltipHtml, '<div class="d3x5_tooltip__content">');
      if (d.properties.immigration) {
        tooltipHtml =  _.concat(tooltipHtml, '<h4>Immigration: ', formatComma(d.properties.immigration), '</h4>');
      }
      if (d.properties.emmigration) {
        tooltipHtml =  _.concat(tooltipHtml, '<br><h4>Emmigration: ', formatComma(d.properties.emmigration), '</h4>');
      }
      if (d.properties.netmigration) {
        tooltipHtml =  _.concat(tooltipHtml, '<br><h4>Net migration: ', formatComma(d.properties.netmigration), '</h4>');
      }

      tooltipHtml =  _.concat(tooltipHtml, '</div>');
      return tooltipHtml.join('');
  };


  map3 = new Map()
    .width(width)
    .height(height)
    .data({values: data})
    .geoData(world)
    // .projection('geoAzimuthalEqualArea')
    .color(colors)
    .colorKey('properties.netmigration')
    .showLabels(3)
    .zoomResetOnOceanClick(true)
    .showToolTipOn('click')
    .toolTipTemplate(toolTipTemplate)
    .debug(true)
    // .backgroundgColor('#6C7C7C')
    ;
}


function mapExample4(world) {

  d3.jsonp('http://api.worldbank.org/countries?per_page=400&format=jsonP&prefix={callback}', function(data) {

    var colors = d3.scaleOrdinal()
      .domain(['HIC', 'UMC', 'LMC', 'LMY', 'LIC'])
      .range(colorBrewer.schemePastel1);

    map4 = new Map()
      .width(width)
      .height(height)
      .data({values: data[1] })
      .geoData(world)
      .projection('geoEckert4')
      .color(colors)
      .colorKey('properties.incomeLevel.id')
      // .texture(textures)
      .zoomResetOnOceanClick(true)
      .showToolTipOn(false)
      // .backgroundgColor('#006994')
      ;

      d3.select('#map4').call(map4.init);

      d3.selectAll('.legend4 > li > span')
        .style('background-color', function(){
          return colors(this.id)
        });

  });
}


// load data
d3.queue()
  .defer(d3.json, 'data/world-topo.json')       // our geometries
  .defer(d3.csv, 'data/FSI-top10-2015.csv')     // demo data fsi
  .defer(d3.json, 'data/demo-data.json')        // our demo data
  .defer(d3.csv, 'data/migration2.csv')         // our demo data
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
   d3.select('#map1').call(map1.init);
   d3.select('#map2').call(map2.init);
   d3.select('#map3').call(map3.init);

}
