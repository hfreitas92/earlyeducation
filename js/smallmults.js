// smallmult.js 
    
function smallmultiples(rawData) {
    
  var fullwidth = 200,
    fullheight = 120,
    margin = {
      top: 15,
      right: 20,
      bottom: 40,
      left: 40
    };

  var width = fullwidth - margin.left - margin.right;
  var height = fullheight - margin.top - margin.bottom;

  var measure= "expenditures";
  

  var data = [],
      circle = null,
      caption = null,
      curYear = null;

  var bisect = d3.bisector(function(d) {
    return d.date;
  }).left;

  var format = d3.time.format("%Y");
  var xScale = d3.time.scale().range([0, width]).clamp(true);
  var yScale = d3.scale.linear().range([height, 0]).clamp(true);

  var xValue = function(d) {
    return d.date;
  };
  var yValue = function(d) {
    return d.count;
  };

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(3)
    .outerTickSize(0)
    .tickFormat(d3.format("$")); 

  var area = d3.svg.area().x(function(d) {
    return xScale(xValue(d));
      }).y0(height).y1(function(d) {
      return yScale(yValue(d));
    });

  // line on top of the area plot
  var line = d3.svg.line().x(function(d) {
      return xScale(xValue(d));
    }).y(function(d) {
      return yScale(yValue(d));
  });

  function setupScales(data) {
    var extentX, maxY;
    maxY = d3.max(data, function(c) {
      return d3.max(c.values, function(d) {
        return yValue(d);
      });
    });
    maxY = maxY + (maxY * 1 / 4);
    yScale.domain([0, maxY]);
    extentX = d3.extent(data[0].values, function(d) {
      return xValue(d);
    });
    return xScale.domain(extentX);
  }

  function transformData(rawData) {
    var format, nest;
    format = d3.time.format("Year %Y");
    rawData.forEach(function(d) {
      d.date = format.parse(d.year);
      d.count = +d[measure]; // variable set above, a global
    });
    var nest = d3.nest().key(function(d) {
      return d.state;
    }).sortValues(function(a, b) {
      return d3.ascending(a.date, b.date);
    }).entries(rawData);
    nest = nest.filter(function(d) {return d.values.length == 16;});
    return nest;
  }

// borrowed from british cooking example: http://britains-diet.labs.theodi.org/?es_p=1359956

  var cols, margin_left;
  function calibrate() {
    cols = Math.floor(window.innerWidth/fullwidth/1.5),
    margin_left = window.innerWidth%fullwidth/1.5;
    console.log("cols", cols);
  }

  function getLeft(i) {
    return margin_left + fullwidth * (i%cols) + "px";
  }

  function getTop(i) {
    return fullheight * Math.floor(i/cols) + "px";
  }

  function setChartDivHeight(data_to_plot) {
  d3.select("#vis").style("height", fullheight * Math.ceil(data_to_plot.length/cols) + "px")
  }

  function layoutCharts(data_to_plot) {
    calibrate();
    setChartDivHeight(data_to_plot);
    setupScales(data_to_plot);

    var charts = d3.select("#vis").selectAll(".chart").data(data_to_plot, function(d) { return d.key; });
    charts.enter().append("div")
      .attr("class", "chart")
      .attr("id", function(d) { return "chart-" + d.key; })
      .style("left", function(d, i) { return getLeft(i); })
      .style("top", function(d, i) { return getTop(i); })
    .each(appendChart);

    charts
      .transition().duration(5000).delay(function(d, i) { return i * 10; })
      .style("left", function(d, i) { return getLeft(i); })
      .style("top", function(d, i) { return getTop(i); });

    charts.exit().remove();
  } // end layout charts


  //d3.csv("data/expenditures_sorted.csv", drawPlots);

    drawPlots(rawData);


    function drawPlots(rawData) {

      data = transformData(rawData);
      // default sort order
      data.sort(function(a, b) {
        return d3.descending(+a.values[b.values.length-1].count, +b.values[a.values.length-1].count);
      });
      layoutCharts(data);

    } // end drawPlots


    function appendChart(data, i) {


      var svg = d3.select(this).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.append("rect")
        .attr("class", "background")
        .style("pointer-events", "all")
        .attr("width", width + margin.right) // extra space for labels that appear
        .attr("height", height).on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

      var lines = svg.append("g");

      lines.append("path")
        .attr("class", "area")
        .style("pointer-events", "none")
        .attr("d", function(c) {
          return area(c.values);
      });
      lines.append("path")
        .attr("class", "line")
        .style("pointer-events", "none")
        .attr("d", function(c) {
        return line(c.values);
      });

      lines.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("y", height)
        .attr("dy", margin.bottom / 2 + 5)
        .attr("x", width / 2).text(function(c) {
          return c.key;
      });

      lines.append("text")
        .attr("class", "static_year")
        .attr("text-anchor", "start")
        .style("pointer-events", "none")
        .attr("dy", 13).attr("y", height)
        .attr("x", 0).text(function(c) {
          return xValue(c.values[0]).getFullYear();
      });
      lines.append("text")
      .attr("class", "static_year")
      .attr("text-anchor", "end")
      .style("pointer-events", "none").attr("dy", 13)
      .attr("y", height).attr("x", width).text(function(c) {
        return xValue(c.values[c.values.length - 1]).getFullYear();
      });

      circle = lines.append("circle")
        .attr("r", 2.2)
        .attr("opacity", 0)
        .style("pointer-events", "none");
      caption = lines.append("text")
        .attr("class", "caption")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", -8);
      curYear = lines.append("text")
        .attr("class", "year")
        .attr("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("dy", 13)
        .attr("y", height);

      svg.append("g").attr("class", "y axis").call(yAxis);

    } // end of append chart

  d3.select("#button-wrap").selectAll("div").on("click", function() {
    var id;
    id = d3.select(this).attr("id");
    d3.select("#button-wrap").selectAll("div").classed("active", false);
    d3.select("#" + id).classed("active", true);

    // sort methods
    if (id == "state") {
      data.sort(function(a, b) { return d3.ascending(a.key, b.key);}); 
    }
    if (id == "count") {
      data.sort(function(a, b) {
        return d3.descending(+a.values[a.values.length-1].count, +b.values[b.values.length-1].count);
      });
    }
    if (id == "decline") {
      data.sort(function(a, b) {
        return d3.descending(a.values[0].count - a.values[a.values.length-1].count,
           b.values[0].count - b.values[b.values.length-1].count);
      });
    }
    layoutCharts(data);
  }); // end button setup
function mouseover() {
    d3.selectAll("circle").attr("opacity", 1.0);
    d3.selectAll(".static_year").classed("hidden", true);
    return mousemove.call(this); // current graph base
    };

    function mousemove() {
      var date, index, year;
      year = xScale.invert(d3.mouse(this)[0]).getFullYear();
      date = format.parse('' + year);
      index = 0;
      d3.select("circle")
        .attr("cx", xScale(date))
        .attr("cy", function(c) {
          index = bisect(c.values, date, 0, c.values.length - 1);
          return yScale(yValue(c.values[index]));
      });
      d3.selectAll("text.caption").attr("x", xScale(date))
        .attr("y", function(c) {
          return yScale(yValue(c.values[index]));
       }).text(function(c) {
        return "$" + yValue(c.values[index]);
        });
      d3.selectAll("text.year").attr("x", xScale(date)).text(year);
    };

    function mouseout() {
      d3.selectAll(".static_year").classed("hidden", false);
      
      d3.selectAll("text.caption").text("");
      d3.selectAll("text.year").text("");
    };
    
} // end small mults fuction 
    
// end of smallmult.js file
