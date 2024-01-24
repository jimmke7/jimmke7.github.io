  var outerWidth = 1000;
  var outerHeight = 250;
  var margin = { left: 225, top: 20, right: 150, bottom: 40 };
  var barPadding = 0.2;
  var legendMarginLeft = 20;

  var xColumn = "percentageValue";
  var yColumn = "processName";
  // select the column that will give a color to each unique value in that column
  var colorColumn = "categoryCriteria";
  var layerColumn = colorColumn
  

  var innerWidth  = outerWidth  - margin.left - margin.right;
  var innerHeight = outerHeight - margin.top  - margin.bottom;


  //creating SVG
  var svg = d3.select("div.main-bar-chart-box").append("svg")
    .attr("display", "block")
    //.attr("top", 0)
    //.attr("left", 0)
    //.attr("bottom", 0)
    //.attr("right", 0)
    .attr("width",  outerWidth)
    .attr("height", outerHeight);
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //creating color legend group, change position of group here
  var colorLegendG = g.append("g")
    .attr("class","color-legend")
    .attr("transform",`translate(${innerWidth + 30}, 5)`);
  

  var xScale = d3.scale.linear().range([0, innerWidth]);
  var yScale = d3.scale.ordinal().rangeBands([innerHeight, 0], barPadding);
  var colorScale = d3.scale.ordinal();
  colorScale.range(["#2C4DA7","#5174D4","#ABBCE9","#FC9648","#E9662C"]);


  // Use a modified SI formatter that uses "B" for Billion.
  var siFormat = d3.format("s");
  var formatPercent = d3.format(".0%");

  var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
    .ticks(5)
    .tickFormat(formatPercent)
    .outerTickSize(0);
  var yAxis = d3.svg.axis().scale(yScale).orient("left")
    .outerTickSize(0);

  // color legend configuration  
  var colorLegend = d3.legend.color()
    .scale(colorScale)
    .shapePadding(5)
    .shapeWidth(15)
    .shapeHeight(15)
    .labelOffset(4)

  var divTooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

  let mouseMove = function (event, d) {
    divTooltip.transition()
      .duration(0)
      .style("opacity", 1);
    divTooltip
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY) + "px");
  }

  function render(data){

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
    bars.enter().append("rect");
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
            divTooltip.html("Doorlooptijd: " + d.categoryCriteria + "<br/>"  + 
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
      .on("mousemove",mouseMove)					
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
  
    colorLegendG.call(colorLegend);

    var xAxisG = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + innerHeight + ")");
    var yAxisG = g.append("g")
    .attr("class", "y axis");

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

  d3.csv("/data/main-stacked-bar-chart.csv", type, render);

