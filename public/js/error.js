function error(body){
  var errorContent = body.append("div")
    .attr("class","modal fade")
    .attr("id","error")
    .attr("tabindex","-1")
    .attr("role","dialog")
    .attr("aria-labelledby","modal")
    .append("div")
      .attr("class","modal-dialog modal-sm")
      .style("width","40%")
      .attr("role","document")
      .append("div")
        .attr("class","modal-content"),
    errorHeader = errorContent.append("div").attr("class","modal-header")
    errorTitle = errorHeader.append("h3")
            .attr("class","modal-title accentRed-500")
            .text("Uh-Oh, An Error Occured"),
    errorClose = errorHeader.append("button")
          .attr("type","button")
          .attr("class","close")
          .attr("data-dismiss","modal")
          .append("span")
            .html("&times"),
    errorBody = errorContent.append("div")
      .attr("class","modal-body clearfix")
      .style("padding-top","0px")
      .append("div")
        .attr("class","alert alert-danger")
        .attr("role","alert")
        .html("An error occured during the last action that you attempted!<br><br>But don't worry, it's been logged and we're looking into it. If you have any questions, please email AJ Kahle at akahle@270strategies.com.<br><br>Thanks!")

    $("#error").modal('show')
}
