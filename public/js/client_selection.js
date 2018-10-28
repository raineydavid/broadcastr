var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host);

ws.onopen = function(event){
    console.log('connected')
    ws.send(JSON.stringify({type:"clients"}))
  }

ws.onmessage = function(event){
  var dataId = JSON.parse(event.data).id
  var data = JSON.parse(event.data).data
  console.log(data)

  switch(dataId){
    case "data":
      var topBar = d3.select("body").append("div")
        .attr("class","topBar")


          topBar.append("div")
          .attr("class","topBarText")
          .text("Broadcastr")
          .style("float","left")

      var footer = d3.select("body").append("footer")
        .append("div")
        .attr("class","container")

      var body = d3.select("body").append("div")

      var container = body.append("div")
        .attr("class","container")
        .style("margin-top","10%")
        .style("background-color","white")

      var selectionRow = container.append("div")
        .attr("class","row")

      selectionRow.append("div")
        .attr("class","col-md-4")

      var selectionFrame = selectionRow.append("div")
        .attr("class","col-md-4")
        .style("background-color","white")

      selectionRow.append("div")
        .attr("class","col-md-4")

      var selectionForm = selectionFrame.append("form")
        .attr("method","POST")
        .attr("enctype","")
        .attr("id","id_selectionForm")
        .attr("name","selectionForm")

      selectionForm.append("div")
        .attr("class","frame-header")
        .text("Select Client")

      selectionForm.append("div")
        .attr("class","form-group")
        .style("margin","auto")
        .style("margin-bottom","15px")
        .style("width","250px")
        .append("select")
          .style("margin","auto")
          .style("width","250px")
          .attr("class","form-control")
          .attr("name","client")
          .style("font-family","Raleway,'Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
        .selectAll("option")
          .data(data)
          .enter().append("option")
          .attr("value",function(d){
            return d.value
          })
          .text(function(d){
            return d.text
          })

          var buttonDiv = selectionForm.append("div")
              .style("margin","auto")

          var button = buttonDiv.append("button")
              .style("margin","auto")
              .style("display","block")
              .attr("class","btn btn-default logoLightBlue-bg-500")
              .attr("id","submitButton")
              .attr("value","submit")
              .text("Submit")

            buttonDiv.style("width",button.node().getBoundingClientRect().width)

    break;
  }

}
