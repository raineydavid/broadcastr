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
      .html("Your registration link has expired. Please contact your manager to request a new one.")
