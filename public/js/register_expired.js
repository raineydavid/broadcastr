var topBar = d3.select("body").append("div")
  .attr("class","topBar")

  topBar.append("a")
    .attr("href","/").append("img")
    .attr("class","logo")
    .attr("src","/logo.png")
    .attr("height",d3.select("body").node().getBoundingClientRect().width*.04)
    .on("load",function(){
      topBar.select(".topBarText")
        .style("height",topBar.select("img").node().getBoundingClientRect().height)
        .style("line-height",topBar.select("img").node().getBoundingClientRect().height+"px")
    })

    topBar.append("div")
    .attr("class","topBarText")
    .text("Echo")
    .style("float","left")

var contentDiv = d3.select("body").append("div")
  .attr("class","content")
  .style("margin-top","5%")

var container = contentDiv.append("div")
  .attr("class","container")
  .style("margin-top","10%")
  .style("background-color","white")

var errorRow = container.append("row")

errorRow.append("div")
  .attr("class","col-md-4")

var errorFrame = errorRow.append("div")
  .attr("class","col-md-4")
  .style("background-color","white")

errorRow.append("div")
  .attr("class","col-md-4")

d3.select("body").append("div")
      .attr("class","alert alert-danger")
      .attr("role","alert")
      .html("Your registration link has expired. Please request a new one.")
