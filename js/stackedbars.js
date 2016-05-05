var margin = {top: 0, right: 150, bottom: 50, left: 50},
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var xScale = d3.scale.ordinal()
    .rangeRoundBands([0, width], .3);

var yScale = d3.scale.linear()
    .rangeRound([height, 0]);

var color = d3.scale.category10()
            .range(["green","#00cc99","#00e6ac","#33ffcc","#ccfff2"]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .innerTickSize([0]);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickFormat(d3.format(".2s")); // for the stacked totals version
    //.tickFormat(d3.format("%")); // for the normalized version
    

var stack = d3.layout
    .stack();
    //.offset("expand");  // use this to get it to be relative/normalized! Default is zero.

var tooltip = d3.select("body").append("div").classed("tooltip", true).style("display", "none");

var svg = d3.select("#stackedbars").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/earlyenrollment.csv", function(error, data) {

  if (error) {
    console.log(error);
  }

  var races = ["Total","Black", "White", "Hispanic", "Asian"];

 // grouping by race, right way:
  var dataToStack = races.map(function(race) {
    return data.map(function(d) {
      return {x: d.State, y: +d[race], race: race};
    })
  });

/*  // grouping by State - wrong way!
var dataToStack = data.map(function(d) { return races.map(function(race) { return {x: d.State, y: +d[race]}; }); })
*/

  var stacked = stack(dataToStack);
  console.log(stacked);

  xScale.domain(data.map(function(d) { return d.State; }));
  // this domain is using the last of the stacked arrays, and getting the max height.
yScale.domain([0, 350]);
    
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
        .attr("dy", ".5em")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");
  



      // we set the colors per race - the outer nesting
  var State = svg.selectAll("g.race")
      .data(stacked)
    .enter().append("g")
      .attr("class", "race")
      .style("fill", function(d, i) { return color(i); });

  // but we draw one rect for each State, bottom up.
  State.selectAll("rect")
      .data(function(d) {
        console.log("array for a rectangle", d);
        return d; })  // this just gets the array for bar segment.
    .enter().append("rect")
      .attr("width", xScale.rangeBand())
      .attr("x", function(d) {
        return xScale(d.x); })
      .attr("y", function(d) {
        return yScale(d.y0 + d.y); }) //
      .attr("height", function(d) {
        return yScale(d.y0) - yScale(d.y0 + d.y); }) // height is base - tallness
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseout", mouseout);

  // Building a legend by hand, based on http://bl.ocks.org/mbostock/3886208

  // NOTE: We are reversing because the bars are build bottom up - and we want the legend
  // colors to match the order in the bars. Use slice to make a copy instead of reversing the
  // original in place.

  var races_reversed = races.slice().reverse();

  var legend = svg.selectAll(".legend")
      .data(color.domain().slice().reverse()) // reverse these too
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", width + 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(function(d, i) { return races_reversed[i].replace(/_/g, " "); });

});

function mouseover(d) {
  // this will highlight both a dot and its line.

  d3.select(this)
    .transition()
    .style("stroke", "black");

  tooltip
    .style("display", null) // this removes the display none setting from it
    .html("<p>Race: " + d.race.replace(/_/g, " ") +
          "<br>Percentage Enrolled: " + d.y + "%" +
          "<br>State: " + d.x + " </p>");
}

function mousemove(d) {
  tooltip
    .style("top", (d3.event.pageY - 10) + "px" )
    .style("left", (d3.event.pageX + 10) + "px");
  }

function mouseout(d) {
  d3.select(this)
    .transition()
    .style("stroke", "none");

  tooltip.style("display", "none");  // this sets it to invisible!
}


