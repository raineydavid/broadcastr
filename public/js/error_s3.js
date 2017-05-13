function navBar(body,data,callback){
  var topBar = body.append("nav")
      .attr("class","navbar topBar")
      .append("div")
        .attr("class","container-fluid")
        .style("margin-bottom","0px")

  var navbarHeader = topBar.append("div")
      .attr("class","navbar-header")

  var collapseButton = navbarHeader.append("button")
      .attr("type","button")
      .attr("class","navbar-toggle collapsed accentRed-bg-500")
      .attr("data-toggle","collapse")
      .attr("data-target","#main-navbar-collapse")
      .attr("aria-expanded","false")

  collapseButton.selectAll("span")
    .data(["sr-only","icon-bar","icon-bar","icon-bar"])
    .enter().append("span")
    .attr("class",function(d,i){
      return d
    })

  navbarHeader.append("a")
      .attr("href","/").append("img")
      .attr("class","logo")
      .attr("src","270FullLogoText.png")
      .attr("width","200px")
      .on("load",function(){
        topBar.select(".topBarText")
          .style("height",topBar.select("img").node().getBoundingClientRect().height)
          .style("line-height",topBar.select("img").node().getBoundingClientRect().height+"px")
        collapsedBreadcrumbs
        .style("height",topBar.select("img").node().getBoundingClientRect().height)
        .style("line-height",topBar.select("img").node().getBoundingClientRect().height+"px")
      })

  navbarHeader.append("div")
        .attr("class","topBarText")
        .text("Capacity Tracker")
        .style("float","left")

var mainNavbar = topBar.append("div")
  .attr("class","collapse navbar-collapse")
  .attr("id","main-navbar-collapse")

var collapsedBreadcrumbs = mainNavbar.append("ul")
  .attr("class","nav navbar-nav navbar-right breadcrumbs")
  .selectAll("li")
    .data(data)
    .enter().append("li")
    .attr("class","dropdown breadcrumb")

collapsedBreadcrumbs.append("a")
    .attr("href","#")
    .attr("class","dropdown-toggle")
    .attr("data-toggle","dropdown")
    .attr("role","button")
    .attr("aria-haspopup","true")
    .attr("aria-expanded","false")
    .text(function(d){
      return d.page_category_name
    })
  .append("span")
  .attr("caret")

collapsedBreadcrumbs.append("ul")
    .attr("class","dropdown-menu")
      .selectAll("li")
        .data(function(d){
          return d.page_names.map(function(a,i){
            return {name:a,html:d.html[i]}
          })
        })
        .enter().append("li")
          .append("a")
          .attr("id",function(d){
              if(d.html!=thisPage){
                return "breadcrumb-link"
              }else{
                return "breadcrumb-thispage"
              }
          })
          .attr("href",function(d){
            if(d.html!=thisPage){
              return d.html
            }
          })
          .text(function(d){
            return d.name
          })

//Stack menu when collapsed
$('#main-navbar-collapse').on('show.bs.collapse', function() {
    $('.breadcrumbs').addClass('nav-stacked');
});

//Unstack menu when not collapsed
$('#main-navbar-collapse').on('hidden.bs.collapse', function() {
    $('.breadcrumbs').removeClass('nav-stacked');
});

return callback("done")

}


var thisPage = '/error'

      navBar(d3.select("body"),[{page_category_name:"",html:[],page_names:[]}],function(done){
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
          .attr("src","help.gif")
          .attr("class","img-responsive")
          .style("margin","auto")


      mitchDiv.append("div")
        .attr("class","col-md-2")
