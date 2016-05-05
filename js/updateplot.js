function updatePlot(data) {         

            var fullwidth = 600;
			var fullheight = 600;

			var margin = { top: 20, right: 10, bottom: 50, left: 50 };

			var width = fullwidth - margin.right - margin.left;
			var height = fullheight - margin.top - margin.bottom;

			// redo this with an object for the margin settings: var margin = {top...}

			var dotRadius = 5; // fix this to a nice value.

			// fill in the margin values here.  Also, we set domain to 0 to 100 since it's percents,
			// plus some padding room!
			var xScale = d3.scale.linear()
								.range([ 0, width])
								.domain([-1, 100]);

			// top to bottom, padding just in case
			var yScale = d3.scale.linear()
								.range([ height, 0 ])
								.domain([-1, 100]);

			//  Custom tick count if you want it.
			// Create your axes here.
			var xAxis = d3.svg.axis()
							.scale(xScale)
							.orient("bottom")
							.ticks(10);  // fix this to a good number of ticks for your scale later.

			var yAxis = d3.svg.axis()
							.scale(yScale)
							.orient("left");

			var svg = d3.select("#plot")
						.append("svg")
						.attr("width", fullwidth)
						.attr("height", fullheight)
						.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.right + ")");

		
            var plotTooltip = d3.select("#plot")
      	                 .append("div")
      	                 .attr("class", "tooltip")
            .style("display", "none");
    
    
    
    
    
    // utility for label placement jitter
		function getRandomInt(min, max) {
  			return Math.floor(Math.random() * (max - min + 1) + min);
				}
plotData(data);
    
function plotData(data) {

				var menu = d3.select("#menu select")
        		.on("change", filter);

				// Set the intial value of drop-down when page loads
      	menu.property("value", "all");

      	svg.append("g")
					.attr("class", "x axis")
					.attr("transform", "translate(0," + height + ")")
					.call(xAxis);

				svg.append("g")
					.attr("class", "y axis")
					.call(yAxis);

				svg.append("text")
					.attr("class", "xlabel")
					.attr("transform", "translate(" + (width / 2) + " ," +
								(height + 25) + ")")
					.style("text-anchor", "middle")
					.attr("dy", 12)
					.text("Repeated A Grade, Less Than A High School Education");

				svg.append("text")
					.attr("class", "ylabel")
					.attr("transform", "rotate(-90) translate(" + (-height/2)
								 + ",0)")
					.style("text-anchor", "middle")
					.attr("dy", -30)
					.text("Repeated A Grade, More Than A High School Education");


				var curSelection = menu.property("value");
      	render(data);  // do the full dataset render first.


      	// Functions for handling updates and drawing with data

				function filter() {
					// Handle the menu change -- filter the data set if needed, rerender:

						curSelection = menu.property("value");

					  if (curSelection === "all") {
					  	var newData = data; // set it equal to all the data
					  } else if (curSelection === "more") { //poorest 10
						  	var newData = data.sort(function(a,b) {
							  		return b.lessThanHigh - a.lessThanHigh;
							  	}).slice(0, 10);
					  } else if (curSelection === "less") {  // descending
						  	var newData = data.sort(function(a,b) { // richest 10
											return a.lessThanHigh - b.lessThanHigh;
							  	}).slice(0, 10);
					  }
					  console.log(newData);
					  render(newData);
				}


				function render(mydata) {

						// Here we set domains, and draw the circles based on what data set it is.


							xScale.domain([
								d3.min(mydata, function(d) {
			  					return +d.lessThanHigh;
			  				}) - 2,
			  				d3.max(mydata, function (d) {
			  					return +d.lessThanHigh;
			  				}) + 2
			  			]);

							yScale.domain([
								d3.min(mydata, function(d) {
			  					return +d.moreThanHigh;
			  				}) - 2,
			  				d3.max(mydata, function (d) {
			  					return +d.moreThanHigh;
			  				}) + 2
			  			]);


							// data join
							var circles = svg.selectAll("circle")
									.data(mydata, function(d) {return d.state;}); // key function!


							// enter and create new ones if needed
							circles
								.enter()
								.append("circle")
								 // this section is to fix some of the animation direction problems
								.attr("cx", function (d) {
									if (curSelection == "more") {
										return width - margin.right;
									}
									else if (curSelection == "less") {
										return margin.left;
									}
								})
								.attr("cy", function (d) {
									if (curSelection == "more") {
										return margin.top;
									}
									else if (curSelection == "less") {
										return height - margin.bottom;
									}
								})  // */
								.attr("class", "dots")
								.on("mouseover", mouseover)
                                .on("mouseout", mouseout)
                                .on("mousemove",mousemove);

							// transition of them
							circles
								.transition()
								.duration(20)
            		.attr("cx", function(d) {
									return xScale(+d.lessThanHigh);
									// return the value to use for your x scale here
								})
								.attr("cy", function(d) {
									return yScale(+d.moreThanHigh);
								})
								.attr("r", function() {
									if (curSelection !== "all") {
										return dotRadius * 2;
									}
									else {
										return dotRadius;
									}
								});


								// fade out the ones that aren't in the current data set
							circles
								.exit()
								.transition()
								.duration(1000)
								.style("opacity", 0)
								.remove();

								// Update the axes - also animated. this is really easy.
							 svg.select(".x.axis")
                  .transition()
                  .duration(1000)
                  .call(xAxis);

                // Update Y Axis
                svg.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .call(yAxis);

                // label the dots if you're only showing 10.
              if (curSelection !== "all") {

	              	// data join with a key
									var labels = svg.selectAll("text.dotlabels")
										.data(mydata, function(d) {
											return d.state;
										});

									// enter and create any news ones we need. Put minimal stuff here.
									labels
											.enter()
											.append("text")
											.attr("transform", function(d) {
											 return "translate(" + xScale(+d.lessThanHigh) + "," + yScale(+d.moreThanHigh) + ")";
											})
											.attr("dx", 5)
											.attr("dy", function(d) {
												// adding some space for the overlapping ones
												if (d.state == "Alaska") 
                                                    {
													return 10;
												} 
                                        
                                                if (d.state == "Minnesota")
                                                {
                                                  return -14;
												}   
                                        else {
													return -4;
												}
											})
											.attr("class", "dotlabels")
											.style("opacity", 0)
											.text(function(d) {return d.state});

											// transition them.
									labels.transition()
										.duration(5000)
										.style("opacity", 1);

										// remove ones that we don't have now
									labels.exit().remove(); // these could have a transition too...

							} else {
								// if we're showing "all countries" - fade out any labels.

								svg.selectAll("text.dotlabels")
								.transition()
								.duration(1000)
								.style("opacity", 0)
								.remove();

							}

						} // end of render
}
			


function mouseover(d) {
       plotTooltip
        .transition()  
        .duration(200)
        .style("display", null);
        plotTooltip.html("<p>In "+ d.state + " " + d.lessThanHigh + "% of kids that come from a houshold where an adult has less than a high school education have repeated 1 or more grades.</p>" +"<br>" + "<p>" +  d.moreThanHigh + "% of kids from a houshold where an adult has more than a high school education have repeated 1 or more grades.</p>");
         
              
}

    
function mousemove (d) {
            plotTooltip
                 .style("left", (d3.event.pageX + 10) + "px")
               .style("top", (d3.event.pageY - 28) + "px");
    d3.select(this).moveToFront();
}
    
function mouseout(d) {
     plotTooltip.transition()
               .duration(500)
                .style("display", "none");
            
               
}





};
