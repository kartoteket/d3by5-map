/* jshint laxcomma: true, quotmark: single */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['lodash', 'd3', 'd3-geo-projection', 'topojson', 'textures', 'iso3166-1'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('lodash'), require('d3'), require('d3-geo-projection'), require('topojson'), require('textures'), require('iso3166-1'));
    } else {
        root.Map = factory(root._, root.d3, root.geoProjection, root.topojson, root.textures, root.iso3166);
    }
}(this, function (_, d3, geoProjection, topojson, textures, iso3166) {

  'use:strict';

  function Map () {

    var map = {

      /**
       * Default option values
       */
      options : {

        data : {},                   // data to visualize
        geoData : {},                // typically topoJson

        width : 960,
        height : 500,
        aspectRatio: 500 / 960,
        margin: 20,                // for now single value
        offSetX: 0,                // shifts the entire map horisointally in pixels
        offSetY: 0,                // shifts the entire map veritcaly in pixels
        zoomMin: 1,                // min zoom level
        zoomMax: 20,               // max zoom level

        baseColor: '#F8EBCB',
        backgroundgColor: '#ffffff',
        accentColor: '#FF6B6B',
        borderColor: '#9DBFB1',
        // fillColorMap: {},         // for simple mapping of fillColors

        projection: 'geoMercator',   // projection
        scale: 2,                    // not quiter sure about this one
        responsive: true,
        graticule: false,            // graticules: a uniform grid of meridians and parallels for showing projection distortion
        projectionFit: true,         // tries to fit the map inside container. Todo: rename ??

        countryIsoCodeMap : null,                 // If the topojson does not store the ISO code in  "geometries.id", use this to map the correct attribute (uses dot notation, eg "properties.countryCode")

        color: null,
        texture: null,
        colorKey: 'properties.fillColorMapKey',
        textureKey: 'properties.texturesMapKey',

        higlightOnHover: false,
        showToolTipOn: 'hover',      // [click, hover, none]

        toolTipTemplate: function(d, data) {
          return '<h3 class="d3x5_tooltip__header">' + d.properties.name + '</h3>';
        },

        assetsUrl: '/',         // base path to asset files
        classPrefix: 'd3x5_',

        // this should maybe be implented as a plugin or similar
        texturesConfig: {
          lines: {
            size: 20,
            strokeWidth: 7,
            stroke: '#2DAE3B',
            background: '#F8EBCB'
          },
          circles: {
            radius: 8,
            size: 30,
            strokeWidth: 4,
            stroke: 'blue',
            fill: '#2DAE3B',
            background: '#F8EBCB'
          },
          paths: {
            d: 'crosses', // hexagons, caps, woven, waves, nylon, squares
            strokeWidth: 2,
            stroke: '#2DAE3B',
            background: '#F8EBCB'
          },
        },
      },


      /**
       * init map
       * @param  {object} selection d3 selction
       * @return {object} the map intance
       */
      init: function (selection) {

        if (arguments.length) {
          this.selection = selection;

          // hook up listener to resize if responsive
          d3.select(window).on('resize',  _.bind(this.resize, this));

          this.draw();
        }

        return this;
      },


      /**
       * [draw description]
       * @return {[type]} [description]
       */
      draw: function () {
        var that = this
          , opt = this.options            // just to shorten...
          , data = opt.data.values        // will probaby need a parser here at some point
          , scale = opt.scale
          , width = opt.width
          , height = opt.height
          , aspectRatio = opt.aspectRatio
          , projection
          , color
          , path
          , dom
          , svg
          , rect
          , g
          , countries
          , neighbors
          , graticule
          , fillTextures = null
          , multipleColors = false        // when looping colorKeys, this get flipped to true of we find a country with moe than one colorkey defined
          , active = d3.select(null)      // selected country
        ;

        this.selection.each(function() {

          // calculate responsive dimensions: We override width, height and scale.
          if(opt.responsive) {

            // get the  canvas dimensions
            canvasWidth = this.getBoundingClientRect().width;
            canvasHeight = window.innerHeight;

            // if aspectRatio is not set explicitly, re-calculate
            if(aspectRatio === opt.height / opt.width) {
              aspectRatio = canvasHeight / canvasWidth;
            }

            width = canvasWidth;
            height = width * aspectRatio;
            scale = Math.max(1, width  / opt.width);    // not really thought this through yet...

          }

          // Projection
          projection = that.setProjection(width, height, scale);

          // Path (TODO: maybe move into setProjection() ??!?)
          path = d3.geoPath().projection(projection);

          // zoom
          var zoom = d3.zoom()
              .scaleExtent([opt.zoomMin, opt.zoomMax])   // min max zoom levels
              .on('zoom', zoomed)
              .on('start', zoomedStart)
              .on('end', zoomedEnd);

          // geoJson
          countries = topojson.feature(opt.geoData, opt.geoData.objects.countries).features;
          neighbors = topojson.neighbors(opt.geoData.objects.countries.geometries);

          // mapping iso country code.
          if(opt.countryIsoCodeMap) {
            var countryIsoCodeMap = opt.countryIsoCodeMap.split('.');
            countries.forEach( function (d) {
                var id = null;
                for (var i=0; i<countryIsoCodeMap.length; i++){
                  id = id ? id[countryIsoCodeMap[i]] : d[countryIsoCodeMap[i]];
                }
                d.id = iso3166.to3(id) || d.id;
            });
          }

          // extend countries properties with custom data
          // TODO. Ad hoc for now, currently just assumes that the data has a country alph3 id as key...
          countries.forEach( function (c) {
              var id = c.id;
              if(_.has(data.countries, id)) {
                _.assign(c.properties, data.countries[id]);
              }
          });

          // Colors
          // Sett scale defaults. Ordinal scales must be explicit and determined
          if(opt.color) {
            opt.color.unknown(opt.baseColor);
          }


          // here we loop countries and check for any keys that map to colors. Defaults to country ID.
          // The keys are stored in a country colorKey property (array) and used as domain input in the defined color scale
          // We also test for multiple colors, so that we can use textures if needed.
          if(opt.colorKey) {

            var colorKey = opt.colorKey.split('.');
            countries.forEach( function (d) {
                var key = null;
                for (var i = 0; i < colorKey.length; i++){
                  key = key ? key[colorKey[i]] : d[colorKey[i]];
                }
                d.colorKey = key || d.id;

                // typecast to array
                d.colorKey = Array.isArray(d.colorKey) ? d.colorKey : [d.colorKey];

                // more than one color key ?
                if(d.colorKey.length > 1) {
                  multipleColors = true;
                }
            });
          }

          // more or less same as above.
          // TODO: dry out this if possible...
          if(opt.textureKey) {
            var textureKey = opt.textureKey.split('.');
            countries.forEach( function (d) {
                var id = null;
                for (var i=0; i<textureKey.length; i++){
                  id = id ? id[textureKey[i]] : d[textureKey[i]];
                }
                d.textureKey = id || null;
            });
          }


          // start wrting to the dom
          dom = d3.select(this);
          dom.style('background', opt.backgroundgColor);

          // cleanup if on redraw. TODO: not very elegant...
          if (dom.select('svg')) {
            dom.select('svg').remove();
          }
          if (dom.select('.'+opt.classPrefix+'tooltip')) {
            dom.select('.'+opt.classPrefix+'tooltip').remove();
          }


          // svg element
          svg = dom.append('svg')
              .attr('width', width)
              .attr('height', height);

          if(opt.offSetX || opt.offSetY) {
            svg.style('transform', function(){
              return 'translateX(' + opt.offSetX + 'px) translateY(' + opt.offSetY + 'px)';
            });
          }

          // Free Zoom (mouseweel, etc). TODO: Add as option "ZoomFree"
          svg.call(zoom);

          // Init Textures
          if(opt.texture || multipleColors) {

            // Create texture which combines two colors. TODO: Possible to do more than two ??!?
            if(multipleColors) {
              opt.texture = d3.scaleOrdinal()
                .domain(opt.texture ? _.concat(opt.texture.domain(), opt.color.domain()) : opt.color.domain())
                .range(opt.texture ? _.concat(opt.texture.range(), opt.color.range()) : opt.color.range());
            }

            // Sett scale defaults. Ordinal scales must be explicit and determined
            opt.texture.unknown(null);

            fillTextures = that.setTextures();

//          create all possible textures we might need to use later
            if(fillTextures) {
              _.forEach(fillTextures, function(t) {
                _.forEach(t, function(tc) {
                  if(_.isFunction(tc)) {
                   svg.call(tc);
                  } else {
                    _.forEach(tc, function(cc) {
                      if(_.isFunction(cc)) {
                       svg.call(cc);
                      }
                    });
                  }
                });
              });
            }
          }

          rect = svg.append('rect')
              .attr('width', width)
              .attr('height', height)
              .style('fill', opt.backgroundgColor)
              .on('click', resetZoom);

          g = svg.append('g').style('font-size', '1em');

          // lat/lng lines
          if(opt.graticule) {
            graticule = d3.geoGraticule();
            g.append('path')
                .datum(graticule)
                .classed(opt.classPrefix + 'graticule', true)
                .attr('d', path);
          }

          /* alternativ method of using multiple layers and a base map...  */
          // basemap = svg.append("g");
          // basemap.selectAll('.'+opt.classPrefix+'basecountry')
          //   .data(countries)
          //   .enter()
          //   .append("path")
          //     .attr("d", path)
          //     .style("fill", opt.baseColor);


          var features = g.selectAll('.'+opt.classPrefix+'country')
            .data(countries)
            .enter()
            .append('path')
              .attr('d', path)
              .attr('id', function(d) {
                return d.id;
              })
              .attr('class', function(d) {
                return opt.classPrefix + 'country ' + _.join(d.properties.groups, ' ');
              })
              .style('fill', function(d, i) {

                // TODO move all this to a setFill()-function ??!?

                // default fill with base color
                var fill = opt.baseColor;

                if(data.countries[d.id]) {
                  fill = opt.color(d.colorKey[0]);

                  // multiple colors, use textures
                  if(d.colorKey.length > 1) {
                      fill2 = opt.color(d.colorKey[1]);
                      if(fillTextures.colors[fill] && fillTextures.colors[fill][fill2]) { // defensive programing FTW
                        fill = fillTextures.colors[fill][fill2].url();

                      // Not a texture as we are displaying only one color for countries which belongs to multiple color groups
                      } else if(fill2 !== opt.baseColor) {
                        fill = fill2;
                      }
                  }

                  else if(fillTextures && opt.texture(d.textureKey)) {
                      fill = fillTextures[opt.texture(d.textureKey)][fill].url();
                  }

                }
                return fill;

                // This colors countries by neigbors. Implement as an option
                // return color(d.color = d3.max(neighbors[i], function(n) {
                //   return countries[n].color;
                // }) + 1 | 0);ble
              })
              .classed(opt.classPrefix + 'clickable', true)
              .on('click', clicked)
              .on('mouseover', that.mouseOver)
              .on('mouseout', that.mouseOut)
              .transition().duration(0)  // 250 TODO: Make thia an optionsparameter (animateDraw ??!?)
          ;

          // add border-lines between countries
          // TODO Toggle as option
          g.append('path')
            .datum(topojson.mesh(opt.geoData, opt.geoData.objects.countries, function(a, b) { return a !== b; }))
            .classed(opt.classPrefix + 'boundary', true)
            .attr('d', path)
            .style('fill', 'none')
            .style('stroke', opt.borderColor);


            // optinal method of applying fill to  entire groups
          // _.forEach(data.groups, function(d, key) {

          //     if(d.countries.length) {

          //       var groupSelector = '#' + _.join(_.map(d.countries, 'id'), ', #');
          //       var elements = d3.selectAll(groupSelector);
          //       var fill;
          //       var color = opt.baseColor;
          //       var texture;

          //       if(_.has(opt.fillColorMap, d.name)) {
          //         color = opt.fillColorMap[d.name];
          //       }
          //       if(_.has(opt.texturesMap, d.name)) {
          //         texture = fillTextures[opt.texturesMap[d.name]][color].url();
          //       }

          //       fill = texture ? texture : color;
          //       elements.attr('fill', fill);
          //   }
          // });


           // add tooltip container element to dom
          if( opt.showToolTipOn === 'click' || opt.showToolTipOn === 'hover' ) {
            map.initToolTip();
          }

          /******************************************
          Zoom methods
          /*************************************** */


          function zoomed() {
            var transform =  d3.event.transform;                                // same as d3.zoomTransform(this);
            g.style('stroke-width', d3.min([1.5 / transform.k, 0.5]) + 'px');   // tweak stroke width according to zoom
            g.style('font-size', d3.min([1 / transform.k, 0.5]) + 'em');        // tweak font-size according to zoom
            g.attr('transform', transform);                                     // apply transform
          }

          function zoomedStart() {
            // console.log(d3.event.type + ' zoom');
          }

          function zoomedEnd() {
            var opt = map.options
              , svg = d3.select(this)
              , zoomLevel = Math.round(d3.event.transform.k)
              , isZoomed = (zoomLevel > opt.zoomMin)
              , isMaxZoom = (zoomLevel === opt.zoomMax)
              , zoomIn = svg.select('.'+opt.classPrefix+'zoom-control--in')
              , zoomOut = svg.select('.'+opt.classPrefix+'zoom-control--out');

            // toggle classes on zoom UI
            // rect.classed(opt.classPrefix + 'clickable', isZoomed);
            zoomOut.classed(opt.classPrefix + 'clickable',isZoomed);
            zoomIn.classed(opt.classPrefix + 'clickable', !isMaxZoom);

            // toggle Tooltip (maybe also ad hoc ??!?)
            if(!isZoomed && (!d3.event.sourceEvent || d3.event.sourceEvent.srcElement.id !== 'RUS')) { // TODO: fails on russia
              svg.select('.'+opt.classPrefix + 'tooltip').classed(opt.classPrefix + 'hidden', true);
            }

            svg.selectAll('.'+opt.classPrefix + 'fadable').classed(opt.classPrefix + 'faded', isZoomed);

            // toggle zoomevent on background rectangle
            if(zoomLevel > 3) { // TODO: Option: ShowLabelsZoomThreshold
              showLabels();
            } else {
              hideLabels();
            }

            // console.log(d3.event.type + ' zoom');
            // console.log('Current zoom level: ' + zoomLevel);
          }

          function resetZoom() {

            active.classed(opt.classPrefix + 'active', false);
            active = d3.select(null);

            svg.transition().duration(750)
               .call(zoom.transform, d3.zoomIdentity);
          }


          /******************************************
          Labels
          /*************************************** */

          // TODO
          // if(showLabel & showLabelZoomThreshold < 1) {
          // showLabels();
          // }

          //TODO: Option: showLabel('name') // d.properties
          function showLabels() {
            var labels
              , opt = map.options;

            labels =  g.selectAll('.'+opt.classPrefix+'label')
              .data(countries)
              .enter()
              .append('text')
                .classed(opt.classPrefix + 'label', true)
                .attr('text-anchor','middle')
                .attr('dy', '.35em')
                .style('fill', '#777') // option: LabelTextColor
                .style('opacity', 0)
                .attr('transform', function(d) {
                  if(!isNaN(path.centroid(d)[0])) {

                    var latlng = path.centroid(d);

                    // ad hoc position fix
                    if (d.id === 'KNA') {
                      latlng = [latlng[0],latlng[1] + 2];
                    } else if (d.id === 'BRB') {
                      latlng = [latlng[0],latlng[1] + 2];
                    }
                    else if (d.id === 'KIR') {
                      return 'translate(' + [117.38496987005313, 694.1484886048762] + ')';
                    }
                    return 'translate(' + latlng + ')';
                  }
                })
                .text(function(d,i) {

                  // ad hoc just skip Saint Martin (French part)
                  if (d.id === 'SXM' || d.id === 'MAF') {
                    return '';
                  }
                  return (d.properties.name);
                })
                .transition().duration(350).style('opacity', 1)  // TODO: Make this an optionsparameter (animateDraw ??!?)
              ;
          }

          function hideLabels() {
            g.selectAll('.'+opt.classPrefix+'label')
              .transition().duration(500).style('opacity', 0).remove();
            // console.log('hideLabels');
          }

          /******************************************
          Map Controls (zoom-button)
          /*************************************** */

          var controls = svg.append('g').classed(opt.classPrefix + 'zoom-controls', true);
          var controlColor = opt.accentColor;

          var controlItems = controls.selectAll('.'+opt.classPrefix+'zoom-control')
            .data(['zoom_in', 'zoom_out'])
            .enter()
            .append('g')
            .attr('class', function(d, i) {
              return opt.classPrefix + 'zoom-control ' + (i ? opt.classPrefix + 'zoom-control--out' : opt.classPrefix + 'zoom-control--in d3x5_clickable');
            })
            .style('transform', function(d, i){
              return 'translateX(' + (30 + 60*i) + 'px) translateY(' + 30 + 'px)';
            })
            .style('font-size', '3em')
            .style('font-weight', 'bold')
          ;

          controlItems.append('text')
            .style('fill', controlColor)
            .attr('y', 23)
            .attr('x', 25)
            .attr('text-anchor','middle')
            .attr('dy', '.35em')
            .text(function(d,i){ return i ? '-' : '+';});

          controlItems.append('rect')
            .attr('id', function(d){return d;})
            .attr('width', 50)
            .attr('height', 50)
            .style('fill', controlColor)
            .style('fill-opacity', 0)
            .style('stroke', controlColor)
            .style('stroke-width', '2px')
            .on('click', function(d) {
              var factor = (d === 'zoom_in') ? 2 : 1/2
                , selection = map.selection.select('svg').transition().duration(350);
              zoom.scaleBy(selection, factor);
            });



          /******************************************
          Events
          /*************************************** */


          /**
           * [clicked description]
           * @param  {[type]} d [description]
           * @return {[type]}   [description]
           */
          function clicked(d) {
            // var opt = map.options;

            // don't collide with d3 zoom/pan -> bail out
            if (d3.event.defaultPrevented) {
              return;
            }

            // what to do if country already is selected ("active")
            if (active.node() === this) {

              // zoom out ?
              // return resetZoom();

              // toggle toolTip?
              // if(opt.showToolTipOn == 'click') {
                // d3.select('.'+opt.classPrefix+'tooltip').classed(opt.classPrefix + 'hidden', true);
              // }
            }

            // pan and zoom to active county
            active.classed(opt.classPrefix + 'active', false);
            active = d3.select(this).classed(opt.classPrefix + 'active', true);
            var bounds = path.bounds(d)
              , dx = bounds[1][0] - bounds[0][0]
              , dy = bounds[1][1] - bounds[0][1]
              , x = (bounds[0][0] + bounds[1][0]) / 2
              , y = (bounds[0][1] + bounds[1][1]) / 2
              , scale
              , translate
              ;

            scale = Math.max(opt.zoomMin, Math.min(opt.zoomMax, opt.zoomMin / Math.max(dx / width, dy / height)));

            // since Russia is so huge, we increase the zoom and shift tha panning a bit to get a better effect.
            if(d.id === 'RUS') {
              scale = scale * 2;
              x = x * 1.3;
            }

            translate = [width / 2 - scale * x, height / 2 - scale * y];

            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

            // show tooltip if bound to click
            if(map.options.showToolTipOn == 'click') {
              map.showToolTip(d, this, 'fixed');
            }


          }
        });
      }, // end draw function


      /**
       * first version of simple method to redraw on resize
       * @return {[type]} [description]
       */
      resize: function() {

        //clean up
        this.selection.each(function() {
          this.childNodes[0].remove();
        });

        // redraw
        this.draw();
      },


      /**
       * mouseOver: Highlight all relevant groups
       * @param  {[type]} d [description]
       * @return {[type]}   [description]
       */
      mouseOver: function(d) {

        var collection
          , classList
          , match
          , opt = map.options
          ;

        // Show tooltip on hover if set
        if(opt.showToolTipOn == 'hover') {
          map.showToolTip(d, this);
        }

        // Higlight group on hover
        if(opt.higlightOnHover) {
          collection = d.properties.groups;
          classList = this.classList;
          match = _.find(collection, function( c ) {
            return classList.contains( c );
          });
        }

        // TODO: Higlight group on hover
        if (opt.higlightOnHover == 'country') {
            console.log('higlight country');
        }


        if(collection && match) {

          // console.log(collection);
          // console.log(opt.color(collection));
          // console.log(opt.texture(collection));
          // console.log(classList);
          // console.log(collection.join(', .'));

          map.selection.selectAll('.'+opt.classPrefix+'country')
            .classed(opt.classPrefix + 'active', false)
            .transition().duration(250).style('opacity', 0.25);
          map.selection.selectAll('.'+collection.join(', .'))
            .classed(opt.classPrefix + 'active', true)
            .transition().duration(250).style('opacity', 1);

          // map.selection.selectAll('.'+opt.classPrefix+'country:not(.d3x5_active)').style('fill', opt.baseColor);
          // map.selection.selectAll('.'+opt.classPrefix+'country').transition().duration(250).style('opacity', 0.25);
          // map.selection.selectAll('.'+collection.join(', .')).transition().duration(250).style('opacity', 1);

        }
      },

      /**
       * [mouseOut description]
       * @param  {[type]} d [description]
       * @return {[type]}   [description]
       */
      mouseOut: function(d) {
        var opt = map.options;

        map.selection.selectAll('.'+opt.classPrefix+'country').transition().duration(250).style('opacity', 1);

         // hide tooltip
        if(opt.showToolTipOn === 'hover') {
         map.selection.select('.'+opt.classPrefix+'tooltip').classed(opt.classPrefix + 'hidden', true);
        }

      },


      /******************************************
      Tooltip
      /*************************************** */

      /**
       * init Tooltip
       */

      initToolTip: function() {
       var opt = map.options;
       // var container = d3.select(this.selection.node().parentNode);

       var toolTip = this.selection
        .append('div')
        .classed(opt.classPrefix + 'tooltip d3x5_hidden', true);

        // if on click, add close button
        if( this.options.showToolTipOn === 'click') {
          toolTip.html('<a href="#" class="d3x5_tooltip__close"><img src="' + opt.assetsUrl +'images/close.svg"></a>');
          toolTip.select('.'+opt.classPrefix+'tooltip__close').on('click', map.closeToolTip);
        }

        toolTip.append('div').classed(opt.classPrefix + 'tooltip__content', true);
      },

      /**
       * close Tooltip
       */
      closeToolTip: function() {
        var opt = map.options
          , toolTip = map.selection.select('.'+opt.classPrefix+'tooltip')
          , toolTipContent = toolTip.select('.'+opt.classPrefix+'tooltip__content')
          ;

        toolTipContent.html('');
        toolTip.classed(opt.classPrefix + 'hidden', true);
      },

      /**
       * show ToolTip
       * @param  {object}  d   [description]
       * @param  {dom}     elm [description]
       * @param  {object}  objects [description]
       */
      showToolTip: function(d, elm, pos){
        var that = this
          , opt = map.options
          , svg = map.selection.select('svg')
          // , toolTip = d3.select(map.selection.node().parentNode).select('.'+opt.classPrefix+'tooltip')
          , toolTip = map.selection.select('.'+opt.classPrefix+'tooltip')
          , toolTipContent = toolTip.select('.'+opt.classPrefix+'tooltip__content')
          , tooltipHtml = map.toolTipContent(d)
          , position = pos || 'cursor'
          , offset = [0,0]
          , cursor
        ;

        // display tooltip
        toolTip.classed(opt.classPrefix + 'hidden', false);

        // write html content.
        toolTipContent.html(tooltipHtml);

        // position: fixed
        if(position == 'fixed') {

          // since we use the centroid, we correct this for some countries for better positioning
          var latlng = d3.geoPath().centroid(d);
          var xy = projection(latlng);

          // console.log(d.id);
          switch(d.id) {
            case 'CHN':
              offset[0] = -400;
              break;
            case 'PHL':
            case 'KOR':
            case 'HKG':
            case 'AUS':
              offset[0] = -200;
              break;
            case 'ZAF':
              offset[1] = -300;
              break;
          }
          this.toolTipPosition(toolTip, xy, offset);
        }

        // position: move with cursor
        else if(position == 'cursor') {
          offset = [15, 15];
          d3.select(elm).on('mousemove', function() {

            var div = d3.select(this);
            // get cursor position
            cursor = d3.mouse(div.node()).map(function(d) {  // svg.node()
                return parseInt(d);
            });
            that.toolTipPosition(toolTip, cursor, offset);
          });
        }

      },

      /**
       * [toolTipPosition description]
       * @param  {[type]} tooltip [description]
       * @param  {[type]} pos     [description]
       * @return {[type]}         [description]
       */
      toolTipPosition: function (toolTip, pos, offset) {
        toolTip.style('top',  (pos[1] + offset[1]) + 'px')
               .style('left', (pos[0] + offset[0]) + 'px');
      },

      /**
       * [toolTipContent description]
       * @param  {[type]} d [description]
       * @return {[type]}   [description]
       */
      toolTipContent: function(d) {
        var opt = map.options;
        return opt.toolTipTemplate(d, opt.data);
      },


      /**
       * projection
       * @param {number} width  map width
       * @param {number} height map height
       * @param {number} scale   map scale
       */
      setProjection: function(width, height, scale) {

          // get either basic projection bundled in d3 or extended from d3-geo-projection
          projection = d3[this.options.projection] || geoProjection[this.options.projection];

          // init projection
          projection = projection();

          // set parallel if projection is gall-peters
          if(this.options.projection === 'geoCylindricalEqualArea') {
             projection.parallel(45);
          }

          if(this.options.projectionFit) {
              // left and top margin = 20. TODO, move top options
              projection.fitExtent([[this.options.margin, this.options.margin], [width-this.options.margin, height-this.options.margin]], topojson.feature(this.options.geoData, {type: 'GeometryCollection', geometries: this.options.geoData.objects.countries.geometries } ));
          } else {
              projection
                .scale(150 * scale)
                .translate([this.options.width/2 * scale, this.options.height/2 * scale]);
          }

          if(this.options.projectionPrecision) {
              projection.precision(this.options.projectionPrecision);
          }

          return projection;
      },


      /**
       * Textures
       * @param {object} opt Options-object
       */
      setTextures: function() {
        var opt = map.options
          , colors
          , r = {
            lines : {},
            circles : {},
            paths : {},
            colors: {}
          };

        // if we are creating texture from mulitple colors, use the color range only, else (texture.range is shapes) also include basecolor
        colors = _.concat(opt.color.range(), opt.baseColor);

        _.forEach(opt.texture.range(), function(t){
          _.forEach(colors, function(c){
            switch(t) {
              case 'lines':
                r.lines[c] = textures.lines()
                  .size(opt.texturesConfig.lines.size)
                  .strokeWidth(opt.texturesConfig.lines.strokeWidth)
                  .stroke(opt.texturesConfig.lines.stroke)
                  .background(c) ; // opt.texturesConfig.lines.background
                break;
              case 'circles':
                r.circles[c] = textures.circles()
                  .radius(opt.texturesConfig.circles.radius)
                  .size(opt.texturesConfig.circles.size)
                  .strokeWidth(opt.texturesConfig.circles.strokeWidth)
                  .stroke(opt.texturesConfig.circles.stroke)
                  .fill(opt.texturesConfig.circles.fill)
                  .background(c) ; // opt.texturesConfig.lines.background
                break;
              case 'paths':
                r.paths[c] = textures.paths()
                  .d(opt.texturesConfig.paths.d)
                  .lighter()
                  .thicker()
                  .stroke(opt.texturesConfig.paths.stroke)
                  .background(c) ;  // opt.texturesConfig.paths.background
                break;
              default:
                r.colors[t] = typeof r.colors[t] === 'undefined' ? {} : r.colors[t];
                if( t !== c && c !== opt.baseColor) {
                  r.colors[t][c] = textures.lines()
                    .size(opt.texturesConfig.lines.size)
                    .strokeWidth(opt.texturesConfig.lines.strokeWidth)
                    .stroke(t)
                    .background(c) ; // opt.texturesConfig.lines.background
                }
                break;
            }
          });
        });
        return r;
      },


      /**
       * setters/getters
       */

      data: function(value) {
        return arguments.length ? (this.options.data = value, this) : this.options.data;
      },
      geoData: function(value) { // or should I call it "topology"...?
        return arguments.length ? (this.options.geoData = value, this) : this.options.geoData;
      },
      width: function(value) {
        return arguments.length ? (this.options.width = value, this) : this.options.width;
      },
      height: function(value) {
        return arguments.length ? (this.options.height = value, this) : this.options.height;
      },
      margin: function(value) {
        return arguments.length ? (this.options.margin = value, this) : this.options.margin;
      },
      offSetX: function(value) {
        return arguments.length ? (this.options.offSetX = value, this) : this.options.offSetX;
      },
      offSetY: function(value) {
        return arguments.length ? (this.options.offSetY = value, this) : this.options.offSetY;
      },
      aspectRatio: function(value) {
        return arguments.length ? (this.options.aspectRatio = value, this) : this.options.aspectRatio;
      },
      baseColor: function(value) {
        return arguments.length ? (this.options.baseColor = value, this) : this.options.baseColor;
      },
      backgroundgColor: function(value) {
        return arguments.length ? (this.options.backgroundgColor = value, this) : this.options.backgroundgColor;
      },
      accentColor: function(value) {
        return arguments.length ? (this.options.accentColor = value, this) : this.options.accentColor;
      },
      borderColor: function(value) {
        return arguments.length ? (this.options.borderColor = value, this) : this.options.borderColor;
      },

      // scales. TODO Rename ?
      color: function(value) {
        return arguments.length ? (this.options.color = value, this) : this.options.color;
      },
      texture: function(value) {
        return arguments.length ? (this.options.texture = value, this) : this.options.texture;
      },

      zoomMin: function(value) {
        return arguments.length ? (this.options.zoomMin = value, this) : this.options.zoomMin;
      },
      zoomMax: function(value) {
        return arguments.length ? (this.options.zoomMax = value, this) : this.options.zoomMax;
      },


      responsive: function(value) {
        return arguments.length ? (this.options.responsive = value, this) : this.options.responsive;
      },
      projection: function(value) {
        return arguments.length ? (this.options.projection = value, this) : this.options.projection;
      },
      graticule: function(value) {
        return arguments.length ? (this.options.graticule = value, this) : this.options.graticule;
      },
      countryIsoCodeMap: function(value) {
        return arguments.length ? (this.options.countryIsoCodeMap = value, this) : this.options.countryIsoCodeMap;
      },

      higlightOnHover: function(value) {
        return arguments.length ? (this.options.higlightOnHover = value, this) : this.options.higlightOnHover;
      },
      showToolTipOn: function(value) {
        return arguments.length ? (this.options.showToolTipOn = value, this) : this.options.showToolTipOn;
      },
      toolTipTemplate: function(value) {
        return arguments.length ? (this.options.toolTipTemplate = value, this) : this.options.toolTipTemplate;
      },

      assetsUrl: function(value) {
        return arguments.length ? (this.options.assetsUrl = value, this) : this.options.assetsUrl;
      },
      classPrefix: function(value) {
        return arguments.length ? (this.options.classPrefix = value, this) : this.options.classPrefix;
      },


      // extra bulk setters/getters
      setOptions: function(value) {
        return arguments.length ? (_.extend(this.options, value), this) :  this.options;
      },
      getOptions: function() {
        return this.options;
      }
    };

    return (map.init());
  }
  return Map;
}));