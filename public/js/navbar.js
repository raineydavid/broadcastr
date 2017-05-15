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
      .attr("src","/logo.png")
      .attr("height",d3.select("body").node().getBoundingClientRect().width*.04)
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
        .text("Echo")
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
      return d.name
    })
  .append("span")
  .attr("caret")

collapsedBreadcrumbs.append("ul")
    .attr("class","dropdown-menu")
      .selectAll("li")
        .data(function(d){
          return d.pages.map(function(a,i){
            return {name:a.name,html:a.html}
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

var footer = d3.select("body").append("footer")
  .append("div")
  .attr("class","container")

footer.append("img")
    .attr("src","/270FullLogoText.png")
    .attr("height","30px")

return callback("done")

}
