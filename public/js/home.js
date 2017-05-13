var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host)

//Page Setup

var thisPage = '/',
    pageHeight = window.innerHeight,
    state = new Object,
    colorArray = ["logoLightBlue-bg-500","accentGreen-bg-500","accentYellow-bg-500","accentRed-bg-500"],
    textColorArray = ["color-white","gray-400","gray-600","gray-900","black"],
    offsetArray = ["col-md-offset-2","",""];

//Date Format Function

var dateFormat = function(date){
  var splitDate = date.split("/")
  return "20"+splitDate[2]+"-"+splitDate[0]+"-"+splitDate[1]
}

//Tooltip

var tooltipDisplay = function tooltipDisplay(msg){
  tooltip.style('opacity', .9)
    .style("display","block")
  tooltip.text(msg)

  if((d3.select("body").node().getBoundingClientRect().width-d3.event.clientX)<tooltip.node().getBoundingClientRect().width+50){
    var tooltipX = -(20 + tooltip.node().getBoundingClientRect().width)
  }else{var tooltipX = 20}

  if((d3.select("body").node().getBoundingClientRect().height-d3.event.clientY)<tooltip.node().getBoundingClientRect().height+30){
    var tooltipY = -(tooltip.node().getBoundingClientRect().height-20)
  }else{var tooltipY = -15}

  tooltip
      .style('left', (d3.event.clientX + tooltipX) + 'px')
      .style('top',  (d3.event.clientY + tooltipY) + 'px')
}

var tooltipHide = function tooltipHide(){
  tooltip.style("display","none")
}

var tooltip = d3.select('body').append('div')
        .attr('id','tooltip')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style("display","none")
        .style("z-index","1051")
        .style("font-family","'Gotham SSm A','Gotham SSm B','Helvetica Neue',Helvetica,Arial,sans-serif")
        .style("font-size",'11px')

ws.onopen = function(event){
    console.log('connected')
  }

ws.onmessage = function(event){
  var dataId = JSON.parse(event.data).id
  var data = JSON.parse(event.data).data

  console.log(data)

  switch(dataId){
    case "pages":
      var body = d3.select("body")
        navBar(body,data,function(d){

        })

      var footer = d3.select("body").select("footer")

      var contentDiv = d3.select("body").append("div")
        .attr("class","container-fluid")
        .append("div")
          .attr("class","row")

      var textCol = contentDiv.append("div")
        .attr("class","col-md-3")

      textCol.append("h3")
        .text("Welcome to Echo!")

      textCol.append("div")
        .attr("class","row col-xs-12")
        .text("Echo is 270's tool for communicating with volunteer, prospects, or supporters over email. Our goal is to make you more efficient so you can spend more time organizing!")

      var menuCol = contentDiv.append("div")
        .attr("class",'col-md-9 row'),
      menuNav = menuCol.append("div")
        .attr("class",'navigation col-md-3')
        .attr("role","navigation"),
      menuPages = menuCol.append("div")
        .attr("class","tab-content col-md-9")
        .selectAll("div")
          .data(data.filter(function(d){
            return d.name!="Home"
          }).map(function(d,i){
            d.colorClass = colorArray[i]
            return d
          }))
          .enter().append("div")
          .attr("class",function(d,i){
            if(i===0){
              return "tab-pane active navigation"
            }else{
              return "tab-pane navigation"
            }
          })
          .attr("role","navigation")
          .attr("id",function(d){
            return "tab-"+d.id
          })
          .style("margin-left","5%")

      menuNav.append("ul")
      .attr("class","nav nav-pills nav-stacked")
      .attr("role","tablist")
      .style("width","100%")
        .selectAll("li")
        .data(data.filter(function(d){
          return d.name!="Home"
        }))
        .enter().append("li")
          .attr("href",function(d){
            return d.html
          })
          .attr("class",function(d,i){
            if(i===0){
              state.pageRoot = d.name
              return colorArray[i] + " active pageRoot"
            }
            return colorArray[i] + " pageRoot"
          })
          .style("width",function(d,i){
            if(i===0){
              return "120%"
            }else{
              return "100%"
            }
          })
          .on("click",function(d){
            var t =  d3.transition()
                        .duration(750)
            if(state.pageRoot!=d.name){
              state.pageRoot = d.name
              d3.select(".pageRoot.active").transition(t).style("width",d3.select(".pageRoot.active").node().getBoundingClientRect().width*(1/1.2)+"px")
              d3.select(this).transition(t).style("width",this.getBoundingClientRect().width*1.2+"px")
            }

          })
        .append("a")
          .attr("href",function(d){return "#tab-"+d.id})
          .attr("data-toggle","pill")
          .text(function(d){return d.name})

        menuPages.append("ul")
          .attr("class","nav nav-pills nav-stacked")
          .attr("role","tablist")
          .style("width","40%")
          .selectAll("li")
          .data(function(d){
            return d.pages.filter(function(page){
              return page.name != 'Logout'
            }).map(function(page){
              page.colorClass = d.colorClass
              return page
            })
          })
          .enter().append("li")
          .attr("class",function(d,i){
            return d.colorClass + " pages"
          })
          .append("a")
            .attr("href",function(d){
              return d.html
            })
            .text(function(d){
              return d.name
            })

    break;
  }
}
