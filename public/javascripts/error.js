var thisPage = '/error'

      navBar(d3.select("body"),[],function(done){

      })

      var container = d3.select("body").append("div")
        .attr("class","container")
        .style("background-color","white")

      var whoopsDiv = container.append("div")
        .attr("class","row")

      whoopsDiv.append("div")
        .attr("class","col-md-2")

      whoopsDiv.append("div")
        .attr("class","col-md-8")
        .append("h1")
          .style("background-color","white")
          .style("text-align","center")
          .style("font-weight","bold")
          .style("font-family","'Gotham SSm A','Gotham SSm B','Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
          .attr("class","logoDarkBlue-500")
          .text("Whoops...")

      whoopsDiv.append("div")
        .attr("class","col-md-2")

      var errorRow = container.append("div")
        .attr("class","row")

      errorRow.append("div")
        .attr("class","col-md-2")

      var errorFrame = errorRow.append("div")
        .attr("class","col-md-8")
        .style("background-color","white")

      errorRow.append("div")
        .attr("class","col-md-2")

      errorFrame.append("div")
            .attr("class","alert alert-danger")
            .attr("role","alert")
            .html("An error occured!<br><br>But don't worry, it's been logged and we're looking into it. If you have any questions, please email AJ Kahle at akahle@270strategies.com.<br><br>Thanks!<br><br><a href='javascript:history.back()'>Go Back</a>")

      var mitchDiv = container.append("div")
        .attr("class","row")

      mitchDiv.append("div")
        .attr("class","col-md-2")

      mitchDiv.append("div")
        .attr("class","col-md-8")
        .append("img")
          .attr("src","/mitch_gifs/help.gif")
          .attr("class","img-responsive")
          .style("margin","auto")


      mitchDiv.append("div")
        .attr("class","col-md-2")


    break;
