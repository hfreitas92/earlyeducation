function dotPlot(data) {

// this is the size of the svg container -- the white part
			var fullwidth = 1000,
				fullheight = 500;

			// these are the margins around the graph. Axes labels go in margins.
			var margin = {top: 20, right: 25, bottom: 20, left: 200};

			var width = 1000 - margin.left - margin.right,
    		height = 500 - margin.top - margin.bottom;

			var widthScale = d3.scale.linear()
								.range([ 0, width]);

			var heightScale = d3.scale.ordinal()
								.rangeRoundBands([ margin.top, height], 0.2);

			var xAxis = d3.svg.axis()
							.scale(widthScale)
							.orient("bottom")
                            .tickFormat(function(d) {
								return "$" + +d
                            });

			var yAxis = d3.svg.axis()
							.scale(heightScale)
							.orient("left")
							.innerTickSize([0]);
            
			var svg = d3.select("#dotsplot")
						.append("svg")
						.attr("width", fullwidth)
						.attr("height", fullheight);
            
            var tooltip_dotplot = d3.select("#dotsplot")
                        .append("div")
                        .attr("class", "tooltip_dotplot")
                        .style("display","none");
                       
            
            

				

				// in this case, i know it's out of 100 because it's percents.
				widthScale.domain([0, 16000]);

				// js map: will make a new array out of all the d.state fields
				heightScale.domain(data.map(function(d) { return d.state; } ));


				// Make the faint lines from y labels to highest dot

               
                
				var linesGrid = svg.selectAll("lines.grid")
					.data(data)
					.enter()
					.append("line");

				linesGrid.attr("class", "grid")
					.attr("x1", margin.left)
					.attr("y1", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					})
					.attr("x2", function(d) {
						return margin.left + widthScale(+d.minNeeded);

					})
					.attr("y2", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					});

				// Make the dotted lines between the dots

				var linesBetween = svg.selectAll("lines.between")
					.data(data)
					.enter()
					.append("line");

				linesBetween.attr("class", "between")
					.attr("x1", function(d) {
						return margin.left + widthScale(+d.spent);
					})
					.attr("y1", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					})
					.attr("x2", function(d) {
						return margin.left + widthScale(d.minNeeded);
					})
					.attr("y2", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					})
					.attr("stroke-dasharray", "5,5")
					.attr("stroke-width", function(d, i) {
						if (i == 7) {
							return "1";
						} else {
							return "0.5";
						}
					})
                    .on("mouseover", mouseoverDif)
                    .on("mouseout",mouseoutDif)
                    .on("mousemove",mousemoveDif);


				// Make the dots for 1990

				var dotsSpent = svg.selectAll("circle.ydotsSpent")
						.data(data)
						.enter()
						.append("circle")
                        .on("mouseover",mouseover)
                        .on("mousemove", mousemove)
                        .on("mouseout", mouseout);

				dotsSpent
					.attr("class", "ydotsSpent")
					.attr("cx", function(d) {
						return margin.left + widthScale(+d.spent);
					})
					.attr("r", heightScale.rangeBand()/2)
					.attr("cy", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					})
					.style("stroke", function(d){
						if (d.state === "Florida") {
							return "black";
						}
					})
					.style("fill", function(d){
						if (d.state === "Florida") {
							return "darkorange";
						}
					})
                    .style("fill", function(d){
						if (d.spent < d.minNeeded) {
							return "indianred";
						}
                        if (d.spent > d.minNeeded) {
							return "green";
						}
					})
					.append("title")
					

				// Make the dots for 2015

				var dotsMinNeeded = svg.selectAll("circle.ydotsMinNeeded")
						.data(data)
						.enter()
						.append("circle")
                        .on("mouseover", mouseoverMin)
                        .on("mouseout",mouseoutMin)
                        .on("mousemove", mousemoveMin);

				dotsMinNeeded
					.attr("class", "ydotsMinNeeded")
					.attr("cx", function(d) {
						return margin.left + widthScale(+d.minNeeded);
					})
					.attr("r", heightScale.rangeBand()/2)
					.attr("cy", function(d) {
						return heightScale(d.state) + heightScale.rangeBand()/2;
					})
					.style("stroke", function(d){
						if (d.state === "Florida") {
							return "black";
						}
					})
					.style("fill", function(d){
						if (d.state === "Florida") {
							return "#476BB2";
						}
					})
					.append("title")
					.text(function(d) {
						return d.state + " in 2015: " + d.minNeeded + "%";
					});

					// add the axes

				svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(" + margin.left + "," + height + ")")
					.call(xAxis);

				svg.append("g")
					.attr("class", "y axis")
					.attr("transform", "translate(" + margin.left + ",0)")
					.call(yAxis);

				svg.append("text")
					.attr("class", "xlabel")
        	.attr("transform", "translate(" + (margin.left + width / 2) + " ," +
        				(height + margin.bottom) + ")")
        	.style("text-anchor", "middle")
        	.attr("dy", "12")
        	.text("Per Child Spending ($)");

       	var allYAxisLabels = d3.selectAll("g.y.axis g.tick text")[0]; // un-nest array
        d3.select(allYAxisLabels[36]).style("font-weight", "bold");

                
                
function mouseout(d) {
                tooltip_dotplot.transition()
                    .duration(500)
                    .style("display", "none");
            }
           
           
            function mouseover(d) {
                tooltip_dotplot
                    .transition()
                    .duration(200)
                    .style("display", null);
                    tooltip_dotplot.html("<h2>" + d.state + "</h2>" + "<br>" + "<p> Reported Resources per child enrolled in Pre-k: " + "$" + d.spent +
                        "</p>");
            }

            function mousemove(d) {
                tooltip_dotplot
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("left", (d3.event.pageX + 10) + "px");
                    d3.select(this).moveToFront();
            }
         
                
function mouseoutMin(d) {
                tooltip_dotplot.transition()
                    .duration(500)
                    .style("display", "none");
            }
           
           
            function mouseoverMin(d) {
                tooltip_dotplot
                    .transition()
                    .duration(200)
                    .style("display", null);
                    tooltip_dotplot.html("<h2>" + d.state + "</h2>" + "<br>" + "<p> Per child spending needed to meet NIEER benchmarks: " + "$" + d.minNeeded +
                        "</p>");
            }

            function mousemoveMin(d) {
                tooltip_dotplot
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("left", (d3.event.pageX + 10) + "px");
                    d3.select(this).moveToFront();
            }                
                
             
                
                
function mouseoutDif(d) {
                tooltip_dotplot.transition()
                    .duration(500)
                    .style("display", "none");
            }
           
           
            function mouseoverDif(d) {
                tooltip_dotplot
                    .transition()
                    .duration(200)
                    .style("display", null);
                if (d.spent > d.minNeeded) {
                 return  tooltip_dotplot.html("<h2>" + d.state + "</h2>" + "<br>" + "<p> Spending per child is " + "$" + d.difference +
                        " over the amount needed</p>");  
                }
               else {
                    tooltip_dotplot.html("<h2>" + d.state + "</h2>" + "<br>" + "<p> Additional per child spending needed: " + "$" + d.difference +
                        "</p>");
               }
            }

            function mousemoveDif(d) {
                tooltip_dotplot
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("left", (d3.event.pageX + 10) + "px");
                    d3.select(this).moveToFront();
            }                    
                
                
			};
