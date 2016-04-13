// map.js
function mymap(json, states) {

    //Width and height of map
    var width = 960;
    var height = 500;

    // D3 Projection
    var projection = d3.geo.albersUsa()
                       .translate([width/2, height/2])    // translate to center of screen
                       .scale([1000]);          // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
                 .projection(projection);  // tell path generator to use albersUsa projection


    // Define linear scale for output
    var stateColor = d3.scale.linear()
                  .range(["#ccfff2", "green"]);


    //Create SVG element and append map to the SVG
    var svg1 = d3.select("#map")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

    // Append Div for tooltip to SVG
    var div1 = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("display", "none");

    drawmap(json, states);
    
    function drawmap(json, states) {

    stateColor.domain(d3.extent(states,function(s) { return s.Total;})); // setting the range of the input data

    // Loop through each state data value in the .csv file
    states.forEach(function(state) {
        // Grab State Name
        var dataState = state.State; 
        
        var dataValue = +state.Total; 
        
        var dataBlack = +state.Black;
        
        var dataWhite = +state.White;
        
        var dataHispanic = +state.Hispanic;
        
        var dataAsian = +state.Asian;

        json.features.forEach(function(j) {
            var jsonState = j.properties.name;
            if (dataState == jsonState) { 
                
                j.properties.totals = dataValue;
                j.properties.blacks = dataBlack;
                j.properties.whites = dataWhite;
                j.properties.hispanics = dataHispanic;
                j.properties.asians = dataAsian;
           
            }
        });
    }); // ends data merge

    
    // Bind the data to the SVG and create one path per GeoJSON feature
    svg1.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d) {
    
            var value = d.properties.totals;
            return stateColor(value);
        })
        .on("mouseover", function(d) {
            div1.transition()
               .duration(200)
               .style("display", null);
            div1.html("<p>In " + d.properties.name +  " " + d.properties.totals + "% of 3 and 4-year-olds are enrolled in a school.</p>" + "<br>" +  d.properties.whites + "% of those 3 and 4-year-olds are white."+ "<br>" +  d.properties.blacks + "% of those 3 and 4-year-olds are black."+ "<br>" + d.properties.hispanics + "% of those 3 and 4-year-olds are latino."+ "<br>" +  d.properties.asians + "% of those 3 and 4-year-olds are asian.")
               .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
        d3.select(this).moveToFront();
        
        })
        // fade out tooltip on mouse out
        .on("mouseout", function(d) {
            div1.transition()
               .duration(500)
               .style("display", "none");
        });
    
    svg1.append("g")
    .attr("class", "legendColors")
        .attr("transform", "translate(800, 200)"); // where we put it on the page!

    var legendColors = d3.legend.color()
    .shapeWidth(10)
    .title("Total Percentage Enrolled")
    .labelFormat(d3.format("1f"))
    .scale(stateColor);

    svg1.select(".legendColors")
    .call(legendColors);


    }  // end drawmap
} // end map 
    
// end map.js