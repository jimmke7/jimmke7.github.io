function splitPerMonthSub(divReference, processDataReference){      
    var divToEnterIn = divReference;  
    var outerWidth = 215;
      var outerHeight = 165;
      var margin = { left: 20, top: 15, right: 20, bottom: 25 };
      var barPadding = 0.2;

      var xColumn = "percentageValue";
      var yColumn = "startCaseMonth";
      // select the column that will give a color to each unique value in that column
      var colorColumn = "categoryCriteria";
      var layerColumn = colorColumn
      

      var innerWidth  = outerWidth  - margin.left - margin.right;
      var innerHeight = outerHeight - margin.top  - margin.bottom;


      //creating SVG
      var svg = d3.select(divToEnterIn).append("svg")
        .attr("width",  outerWidth)
        .attr("height", outerHeight)
        .attr("class","detail-bar-chart");;
      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      

      var xScale = d3.scale.linear().range([0, innerWidth]);
      var yScale = d3.scale.ordinal().rangeBands([innerHeight, 0], barPadding);
      var colorScale = d3.scale.ordinal();
      colorScale.range(["#2C4DA7","#5174D4","#ABBCE9","#FC9648","#E9662C"]);


      // Use a modified SI formatter that uses "B" for Billion.
      var formatPercent = d3.format(".0%");

      var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        .ticks(5)
        .tickFormat(formatPercent)
        .outerTickSize(0);
      var yAxis = d3.svg.axis().scale(yScale).orient("left")
        .outerTickSize(0);


      var divTooltip = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);

      function render(data){
        data = data.filter(function(d){return d.processName == processDataReference;})
        var nested = d3.nest()
          .key(function (d){ return d[layerColumn]; })
          .entries(data);


        var stack = d3.layout.stack()
          .y(function (d){return d[xColumn];})
          .values(function (d){ return d.values; });
        
        var layers = stack(nested);

        
        
        xScale.domain([
          0,
          d3.max(layers, function (layer){
            return d3.max(layer.values, function (d){
              return d.y0 + d.y;
            });
          })
        ]);
        
        yScale.domain(layers[0].values.map( function (d){ return d[yColumn]; }));

        colorScale.domain(layers.map(function (layer){
          return layer.key;
        }));


        var layerGroups = g.selectAll(".layer").data(layers);
        layerGroups.enter().append("g").attr("class", "layer");
        layerGroups.exit().remove();
        layerGroups.style("fill", function (d){
          return colorScale(d.key);
        });


        var bars = layerGroups.selectAll("rect").data(function (d){
          return d.values //can call d layer
        });
        bars.enter().append("rect")
        bars.exit().remove();  
        bars
          .attr("height", yScale.rangeBand())
          .attr("x", function (d){ return xScale(d.y0)})
          .attr("y",      function (d){ return yScale(d[yColumn]); })
          .attr("width", function (d){ return xScale(d[xColumn]); })
          .on("mouseover", function(d) {
            //change opacity bars on hover
            bars.transition()
              .duration(0)
              .style("opacity", .3);		
            divTooltip.transition()		
                .duration(0)		
                .style("opacity", 0.9);		
            divTooltip.html("Maand: " + d.startCaseMonth + "<br/>"  + 
                            "Doorlooptijd: " + d.categoryCriteria + "<br/>"  + 
                            "Percentage: " + parseFloat(d.percentageValue *100).toFixed(1)+"%" + "<br/>" + 
                            "Cases: " + d.processCategoryCount
                            )	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px")
                .style("stroke", "black")
                .style("stroke-width","1px")
                .style("background", ()=>{
                  return d3.select(this.parentNode).style("fill")} );
            d3.select(this).transition()
              .duration(0)
              .style("opacity",1);
            })					
          .on("mouseout", function(d) {		
            divTooltip.transition()		
                .duration(0)
                .style("opacity", 0);
            bars.transition()
                .duration(0)
                .style("opacity", 1);
            d3.select(this).transition()
                .duration(0)
                .style("opacity",1);
          })


        // make axis
        var xAxisG = g.append("g")
        .attr("class", "x axis monthly")
        .attr("transform", "translate(0," + innerHeight + ")");
        var yAxisG = g.append("g")
        .attr("class", "y axis monthly");
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        //make grid lines dotted
        d3.selectAll(".tick line")
        .style("stroke-dasharray","5 5")
        .style("stroke","white")
      }


      function type(d){
        d.percentageValue = +d.percentageValue;
        return d;
      }

      d3.csv("/data/panelChartMonthly/detail-chart-per-month-full-dataset.csv", type, render);

}

function splitPerMonth(){
  var processDataReferenceArray = [
    "Voorbereiden NP",
    "Verzoek Info eigen situatie",
    "Toekennen NP",
    "SVB rechtsgegevens",
    "Beeind. agv overlijden"
  ]

  var divReferenceArray = ["div#panel-chart1",
    "div#panel-chart2",
    "div#panel-chart3",
    "div#panel-chart4",
    "div#panel-chart5"
  ]

  //change button colors
  d3.selectAll("div.div-button")
    .style("background-color","white")

  d3.selectAll("div.div-button#split-button2")
  .style("background-color","#FFB765")

  //Unide the panel chart divs
  d3.selectAll("div.grid-container2-item")
    .style("visibility","visible")

  //delete current existing detail bar charts
  d3.selectAll("svg.detail-bar-chart").remove()


  
  var i = 0;
  for (i = 0; i < processDataReferenceArray.length; i++) {
    processDataReference = processDataReferenceArray[i]
    divReference = divReferenceArray[i]
    splitPerMonthSub(divReference, processDataReference);
  }
}
