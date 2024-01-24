
var units = "Widgets";

// set the dimensions and margins of the graph
var margin = {top: 0, right: 50, bottom: 10, left: 50},
    width = 1200 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
var svg = d3.select(".sankey-box").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Create the svg:defs element and the main gradient definition.
var svgDefs = svg.append('defs');

var mainGradient = svgDefs.append('linearGradient')
    .attr('id', 'mainGradient');

// Create the stops of the main gradient. Each stop will be assigned
// a class to style the stop using CSS.
mainGradient.append('stop')
    .attr('class', 'stop-left')
    .attr('offset', '0');

mainGradient.append('stop')
    .attr('class', 'stop-right')
    .attr('offset', '1');


// Configure Tooltip
var divTooltip = d3.select("body").append("div")	
  .attr("class", "tooltip")				
  .style("opacity", 0);


let mouseOver = function(d){
  divTooltip.transition()
    .duration(0)
    .style("opacity", 0.8);
  divTooltip
    .style("stroke", "black")
    .style("stroke-width","1px")
}

let mouseOut = function(d){
  divTooltip.transition()		
      .duration(0)
      .style("opacity", 0);
}


let mouseMove = function (event, d) {
  divTooltip.transition()
    .duration(0)
    .style("opacity", 1);
  divTooltip
    .style("left", (d3.event.pageX) + 10 + "px")
    .style("top", (d3.event.pageY) + "px");
}


// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(50)
    .size([width, height]);

var path = sankey.link();

// load the data
d3.csv("data/chopped-prepped-sankey-data.csv", function(error, data) {
 
  //set up graph in same style as original example but empty
  graph = {"nodes" : [], "links" : []};

  data.forEach(function (d) {
    graph.nodes.push({ "name": d.source});
    graph.nodes.push({ "name": d.target });
    graph.links.push({ "source": d.source,
                       "target": d.target,
                       "value": +d.value,
                        "linkType": "notDetermined"});
   });
  // return only the distinct / unique nodes
  graph.nodes = d3.keys(d3.nest()
    .key(function (d) { return d.name; })
    .object(graph.nodes));

  // loop through each link replacing the text with its index from node
  graph.links.forEach(function (d, i) {
    graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
    graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
  });

  // now loop through each nodes to make nodes an array of objects
  // rather than an array of strings
  graph.nodes.forEach(function (d, i) {
    graph.nodes[i] = { "name": d };
  });

  //All data is now loaded from csv to json format in links and nodes


  var goodEndNode = "Eind ken NabestaandenPensioen toe"
  var goodEndNodeArray = [goodEndNode]

  function determineGoodEndNodes(){
    var j = 0
    while(goodEndNode != "Ken NabestaandenPensioen toe Startevent"){
      for(i=0; i < graph.links.length; i++){
        if(graph.nodes[graph.links[i].target].name === goodEndNode){
            goodEndNode = graph.nodes[graph.links[i].source].name
            goodEndNodeArray.push(goodEndNode)
            
            i = graph.links.length
            j = j + 1
        }
      }
    }
  };

  determineGoodEndNodes()

  var sourceNodesArray = []
  var targetNodesArray = []
  var startOrEndNodesArray = []

  function determineTargetAndSourceNodes(){
    //Getting only the nodes that are a source node
    for(i=0; i < graph.links.length; i++){
      if(sourceNodesArray.includes(graph.nodes[graph.links[i].source].name) === false)
      sourceNodesArray.push(graph.nodes[graph.links[i].source].name)
    }

    //Getting the nodes that are a Target node
    for(i=0; i < graph.links.length; i++){
      if(targetNodesArray.includes(graph.nodes[graph.links[i].target].name) === false)
      targetNodesArray.push(graph.nodes[graph.links[i].target].name)
    };
    
    //Getting nodes that are target and source in 1
    for(i=0; i < graph.nodes.length; i++){
      //add end nodes to array
      if(sourceNodesArray.includes(graph.nodes[i].name) === false){
        startOrEndNodesArray.push(graph.nodes[i].name)
      };
      //add start nodes to array
      if(targetNodesArray.includes(graph.nodes[i].name) === false){
        startOrEndNodesArray.push(graph.nodes[i].name)
      };
    };
  }

  determineTargetAndSourceNodes()

  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(15);

  // add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("id", function(d,i){return i})
      .attr("class", function(d,i){
        // check for good to good link
        if(goodEndNodeArray.includes(d.source.name) && goodEndNodeArray.includes(d.target.name) ){
          return "goodToGoodLink " + "link"
        }

        // check for good to bad link
        if(goodEndNodeArray.includes(d.source.name) && goodEndNodeArray.includes(d.target.name) === false ){
          return "outlined " + "link"
        }

        // check for bad to bad link
        if(goodEndNodeArray.includes(d.source.name) === false && goodEndNodeArray.includes(d.target.name) === false ){
          return "badToBadLink " + "link"
        }
      })
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .style("stroke",function(d){
          if(d.linkType === "NotDetermined"){
              return "#000";
          };
      })
      .on("mouseover",function(d){
        divTooltip.html(
          "Cases: " + d.value + "<br>" +
          "Source Node: " + d.source.name + "<br>" +
          "Target Node: " + d.target.name
        );
        divTooltip.style("background", "#f7f7f7");

      })
      .on("mouseout",mouseOut)
      .on("mousemove",mouseMove)
      .sort(function(a, b) { return b.dy - a.dy; });



  // add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .subject(function(d) {
          return d;
        })
        .on("start", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove));

  // add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) {
        if(goodEndNodeArray.includes(d.name)){
          return "#5174D4"
        }
        else{return "#FC9648"}
      })
      .style("stroke", function(d) { 
		  return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { 
		  return d.name + "\n" + format(d.value); });

  // add in the title for the nodes
  node.append("text")
      .attr("class","nodeText")
      .attr("id",function(d){
        if(startOrEndNodesArray.includes(d.name)){
          return "main-node-text"
        }
        else{return "sub-node-text"}
      })
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) {return d.name})
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    
    d3.selectAll("#sub-node-text")
      .attr("visibility","hidden")

    // link.append("text")
    //   .attr("class", "linkText")
    //   .attr("x", -6)
    //   .attr("y", function(d) { return d.dy / 2; })
    //   .attr("dy", ".35em")
    //   .text("Hello World")
    
    // Add a text label.
    var text = svg.append("text")
        .attr("x", 50)
        .attr("dy", 15);


    for(i=0; i < graph.links.length; i++){
      var text = svg.append("text")
        .attr("x", 50)
        .attr("dy", 15);
    
      text.append("textPath")
        .attr("stroke","black")
        .attr("class", "linkValueText")
        .attr("visibility","hidden")
        .attr("xlink:href","#" + i)
        .text(function(d){
          return "Hello World"
        });
    }


  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .attr("transform", 
            "translate(" 
               + d.x + "," 
               + (d.y = Math.max(
                  0, Math.min(height - d.dy, d3.event.y))
                 ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }

  
  function showAllNodeNames(){

    if(d3.selectAll("#sub-node-text").attr("visibility") === "visible"){
      d3.selectAll("#sub-node-text")
      .attr("visibility","hidden");

      d3.select("#button1")
      .style("background-color","white");
    }
    else if(d3.selectAll("#sub-node-text").attr("visibility") === "hidden"){
      d3.selectAll("#sub-node-text")
      .attr("visibility","visible");
      d3.select("#button1")
        .style("background-color","#FFB765")
    }
    else{console.log("No Valid Show Node Status")}
  }

  function showAllLinkValues(){
    console.log("test")
    if(d3.selectAll(".linkValueText").attr("visibility") === "visible"){
      d3.selectAll(".linkValueText")
      .attr("visibility","hidden");

      d3.select("#button2")
      .style("background-color","white");
    }
    else if(d3.selectAll(".linkValueText").attr("visibility") === "hidden"){
      d3.selectAll(".linkValueText")
        .attr("visibility","visible");
      d3.select("#button2")
        .style("background-color","#FFB765")
    }
    else{console.log("No Valid Show Node Status")}
  }



  function addFunctionsToButtons(){
    d3.select("#button1")
      .on("click",showAllNodeNames);
    d3.select("#button2")
      .on("click",showAllLinkValues);
  }

  addFunctionsToButtons()


});

