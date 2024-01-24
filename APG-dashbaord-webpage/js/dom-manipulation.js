divButtons = d3.selectAll("div.div-button")

divButtons.on("mouseover", function() {
    if(d3.select(this).style("background-color") === "rgb(255, 255, 255)"){
    d3.select(this).style("background-color","rgb(255, 240, 224)")
    }
  }
);


divButtons.on("mouseout", function() {
    if(d3.select(this).style("background-color") === "rgb(255, 240, 224)"){
      d3.select(this).style("background-color","rgb(255, 255, 255)")
    };
  }
);
