    //RELEVANT SOURCES:

    //https://codepen.io/freeCodeCamp/pen/mVEJag
    //API reference: https://github.com/d3/d3/blob/master/API.md#geographies-d3-geo
    //map of earth: https://bl.ocks.org/mbostock/4180634
    //spherical mercator: https://bl.ocks.org/mbostock/3757132
    //let's make a map: https://bost.ocks.org/mike/map/   
    //map with countries: http://bl.ocks.org/MaciejKus/61e9ff1591355b00c1c1caf31e76a668
    //zoom to Bounding Box: https://bl.ocks.org/iamkevinv/0a24e9126cd2fa6b283c6f2d774b69a2    
    //world atals topojson https://github.com/topojson/world-atlas
    //http://eyeseast.github.io/visible-data/2013/08/26/responsive-d3/
    //https://stackoverflow.com/questions/14265112/d3-js-map-svg-auto-fit-into-parent-container-and-resize-with-window
    //responsive map: http://bl.ocks.org/radiocontrolled/7698088
    //https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
    //responding to resize: https://bl.ocks.org/curran/3a68b0c81991e2e94b19
    //https://chartio.com/resources/tutorials/how-to-resize-an-svg-when-the-window-is-resized-in-d3-js/
    

    var svgWidth = window.innerWidth*0.95;    
    var svgHeight = svgWidth/2;
    var width = "100%";
    var height = "100%"; 
    var hue = 0;
    var colors = {};
   

    //projections transform spherical polygonal geometry to planar polygonal geometry
    //projection - project the specified point from the sphere to the plane
    //mercator - the spherical Mercator projection

    //If translate is specified, sets the projection’s translation offset to the specified two-element array [tx, ty] and returns the projection.
    // If translate is not specified, returns the current translation offset which defaults to [480, 250]. The translation offset determines 
    //the pixel coordinates of the projection’s center. The default translation offset places ⟨0°,0°⟩ at the center of a 960×500 area.

    //If scale is specified, sets the projection’s scale factor to the specified value and returns the projection. If scale is not specified, 
    //returns the current scale factor; the default scale is projection-specific. The scale factor corresponds linearly to the distance between 
    //projected points; however, absolute scale factors are not equivalent across projections.

    var projection = d3.geoMercator()
      .translate([svgWidth / 2, svgHeight / 1.8])
      .scale(300);

    //initialize zoom: d3.zoom creates zoom behaviour
    //the returned behavior, zoom, is both an object and a function, 
    //and is typically applied to selected elements via selection.call.
    //example: selection.call(d3.zoom().on("zoom", zoomed));

    //https://github.com/d3/d3-zoom/blob/master/README.md#zoom_scaleExtent
    //If extent is specified, sets the scale extent to the specified array of numbers [k0, k1] 
    //where k0 is the minimum allowed scale factor and k1 //is the maximum allowed scale factor, 
    //and returns this zoom behavior. If extent is not specified, returns the current scale extent, 
    //which defaults to [0, ∞]. 

    var zoom = d3.zoom()
      // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
      //will throw an error, obviously, if applied
      //.translate([0, 0]) 
      //.scale(1) 
      .scaleExtent([0.5, 15])
      .on("zoom", zoomed);

    //create a new geographic path generator
    //if projection is specified, sets the current projection
    var path = d3.geoPath()
        .projection(projection); 

    //create an svg element
    var svg = d3.select('#content-container')
        .append('svg')
        .attr('width', svgWidth)
        //.attr('height', svgHeight) 
        //svg is getting its height from resize()

   //set background: create a rectangle of the same width and height 
   //as the svg element the rectangle is appended to
   //#0077be - ocean blue color
    svg.append('rect')
        .attr('width', width)
        .attr('height', height) 
        .attr('fill', '#0077be')
        .call(zoom);
        //.on("wheel", function() { d3.event.preventDefault(); });

    //add event listener
    //catch window.onresize, and resize the map
    d3.select(window).on("resize", resize);    

    //tooltip for displaying meteorite information
    var tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);    

    //create a map element
    var map = svg.append('g');

    //map of earth
    //tutorial: https://bl.ocks.org/mbostock/4180634
    //https://github.com/d3/d3.github.com/blob/master/world-50m.v1.json
    d3.json('https://d3js.org/world-50m.v1.json', (world) => {
      var countries = topojson.feature(world, world.objects.countries).features;
      map.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('fill', '#ffe6cc')
        .attr('stroke', ' #0077be')
        .attr('d', path)
        .call(zoom) 
    });

    
  var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
    
    
  // Data points
  d3.json(url, (json) => {
    //sort by year
    json.features.sort((a,b) => {
      return new Date(a.properties.year) - new Date(b.properties.year);
    })
    //give avery data point a color attribute
    json.features.map((element) => {
      hue+=.5;
      colors[element.properties.year] = hue;
      element.color = 'hsl(' + hue + ',100%, 50%)';
    })
  //sort by mass from big to small
  json.features.sort((a,b) => {
    return b.properties.mass - a.properties.mass
  })

  var meteorites = svg.append('g')
      .selectAll('path')
      .data(json.features)
      .enter()
      .append('circle')
      //The point must be specified as a two-element array [longitude, latitude] in degrees. 
      .attr('cx', (d) => projection([d.properties.reclong,d.properties.reclat])[0])
      .attr('cy', (d) => projection([d.properties.reclong,d.properties.reclat])[1])
      .attr('r', (d) => { 

        var range = 718750/2/2;
    
        if (d.properties.mass <= range) return 2;
        else if (d.properties.mass <= range*2) return 10;
        else if (d.properties.mass <= range*3) return 20;
        else if (d.properties.mass <= range*20) return 30;
        else if (d.properties.mass <= range*100) return 40;
        return 50;
      })
      .attr('fill-opacity', (d) => {
        var range = 718750/2/2;
        if (d.properties.mass <= range) return 1;
        return .5;
      })
      .attr('stroke-width', 1)
      .attr('stroke', '#EAFFD0')
      .attr('fill', (d) => d.color)
      .on('mouseover', function(d) {
        d3.select(this).attr('d', path).style('fill', 'black');
        // Show tooltip
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html( '<span class="def">fall:</span> ' + d.properties.fall + '<br>' + 
                  '<span class="def">mass:</span> ' + d.properties.mass + '<br>' + 
                  '<span class="def">name:</span> ' + d.properties.name + '<br>' + 
                  '<span class="def">nametype:</span> ' + d.properties.nametype + '<br>' +
                  '<span class="def">recclass:</span> ' + d.properties.recclass + '<br>' + 
                  '<span class="def">reclat:</span> ' + d.properties.reclat + '<br>' + 
                  '<span class="def">reclat:</span> ' + d.properties.reclong + '<br>' + 
                  '<span class="def">year:</span> ' + d.properties.year + '<br>')
          .style('left', (d3.event.pageX+30) + 'px')
          .style('top', (d3.event.pageY/1.5) + 'px')
      })
      .on('mouseout', function(d) {
        // Reset color of dot
        d3.select(this).attr('d', path).style('fill', (d) => d.properties.hsl);

        // Fade out tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  
    //draw the map the first time (initialize the map sizes)
    resize();
  });

    //Move and scale map and meteorites on interaction
    //To apply the transformation to SVG:
    //g.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
    function zoomed() {
      map.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      meteorites.attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
    }

    //Resize map and meteorites on window resize
    //there are two g - map and meteorites appended to svg
    function resize() {
      d3.selectAll("g").attr("transform", "scale(" + $("#content-container").width()/1900 + ")");
      $("svg").height($("#content-container").width()/2);
    }


 