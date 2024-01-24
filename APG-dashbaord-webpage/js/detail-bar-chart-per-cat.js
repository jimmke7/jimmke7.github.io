function splitPerCatSub(divReference, processDataReference, svgID){
    var divToEnterIn = divReference;
      var outerWidth = 220;
      var outerHeight = 165;
      var margin = { left: 5, top: 15, right: 40, bottom: 25 };
      var barPadding = 0.2;

      var xColumn = "processCategoryCount";
      var yColumn = "categoryCriteria";
      var colorColumn = "categoryCriteria";

      var innerWidth  = outerWidth  - margin.left - margin.right;
      var innerHeight = outerHeight - margin.top  - margin.bottom;


      //creating SVG
      var svg = d3.select(divToEnterIn).append("svg")
        .attr("width",  outerWidth)
        .attr("height", outerHeight)
        .attr("class","detail-bar-chart")
        .attr("id", svgID);
      var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      var xAxisG = g.append("g")
        .attr("class", "x axis cat")
        .attr("transform", "translate(0," + innerHeight + ")");
      var yAxisG = g.append("g")
        .attr("class", "y axis");
    
      svg.append("rect")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .attr("opacity",0)

      var xScale = d3.scale.linear().range([0, innerWidth]);
      var yScale = d3.scale.ordinal().rangeBands([innerHeight, 0], barPadding);
      var colorScale = d3.scale.ordinal();
      colorScale.range(["#2C4DA7","#5174D4","#ABBCE9","#FC9648","#E9662C"]);
 
      // Use a modified SI formatter that uses "B" for Billion.
      var siFormat = d3.format("s");
      var customTickFormat = function (d){
        return siFormat(d).replace("G", "B");
      };

      var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
        .ticks(3)
        .tickFormat(customTickFormat)
        .outerTickSize(0);
      var yAxis = d3.svg.axis().scale(yScale).orient("left")
        .outerTickSize(0);


        
      function render(data){
        // data get filtered
        data = data.filter(function(d){return d.processName == processDataReference;})
        xScale.domain([0, d3.max(data, function (d){ return d[xColumn]; })]);
        yScale.domain(       data.map( function (d){ return d[yColumn]; }));
        colorScale.domain(data.map(function (d){ return d[colorColumn];}));

        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        var bars = g.append("g").selectAll("rect").data(data);
        bars.enter().append("rect")
        bars
          .attr("height", yScale.rangeBand())
          .attr("x",0)
          .attr("y",      function (d){ return               yScale(d[yColumn]); })
          .attr("width", function (d){ return xScale(d[xColumn]); })
          .attr("fill", function (d){return colorScale(d[colorColumn]); });

        bars.exit().remove();

        g.selectAll("text.bar-text")
        .data(data)
      .enter().append("text")
        .attr("class","bar-text")
        .attr("id", svgID)
        .attr("text-anchor","start")
        .attr("y",      function (d){return yScale(d[yColumn]) + (yScale.rangeBand() / 1.3); })
        .attr("x", function (d){ return xScale(d[xColumn]) + 3; })
        .text(function(d){return d.processCategoryCount})
          .attr("opacity", 0)


        // add id to panel chart svg
        

        svg.on("mouseover",function(d){
          d3.selectAll("text" + "#" + d3.select(this).attr("id"))
            .attr("opacity",1)
        })

        svg.on("mouseout",function(d){
          d3.selectAll("text" + "#" + d3.select(this).attr("id"))
            .attr("opacity",0)
        })
    
      }

      function type(d){
        d.processCategoryCount = +d.processCategoryCount;
        return d;
      }
      d3.csv("/data/panelChartCategorical/detail-chart-per-cat-full-dataset.csv", type, render);
}











function splitPerCat() {
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

  d3.selectAll("div.div-button#split-button1")
  .style("background-color","#FFB765")


  //delete current existing detail bar charts
  d3.selectAll("svg.detail-bar-chart").remove() 

  
  var i;
  for (i = 0; i < processDataReferenceArray.length; i++) {
    var svgID = "panelChart" + (i + 1)
    processDataReference = processDataReferenceArray[i]
    divReference = divReferenceArray[i]
    splitPerCatSub(divReference, processDataReference, svgID);
  }
}

splitPerCat()

















