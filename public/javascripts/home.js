var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host)

//Page Setup

var thisPage = '/',
    pageHeight = window.innerHeight,
    state = new Object,
    colorArray = ["logoDarkBlue-bg-500","logoLightBlue-bg-500","accentGreen-bg-500","logoDarkBlue-bg-500"],
    offsetArray = ["col-md-offset-2","",""]

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

  switch(dataId){
    case "pages":
      var body = d3.select("body")
        navBar(body,data,function(d){
          ws.send(JSON.stringify({type:"exports"}))
        })

      var footer = d3.select("body").select("footer")

      var contentDiv = d3.select("body").append("div")
        .attr("class","container-fluid")
        .append("div")
          .attr("class","row")

      var textCol = contentDiv.append("div")
        .attr("class","col-md-4")

      textCol.append("h3")
        .text("Welcome to Echo!")

      textCol.append("div")
        .attr("class","row col-xs-12")

      var menuCol = contentDiv.append("div")
        .attr("class",'col-md-8')

      menuCol.selectAll("div")
        .data(data.filter(function(d){
          return d.name!="Home" && d.name!="Logout"
        }))
        .enter().append("div")
        .append("a")
          .attr("href",function(d){
            return d.html
          })
        .attr("class",function(d,i){
          return colorArray[i] + " col-md-3 color-white homeRow " + offsetArray[i%3]
        })
        .on("mouseover",function(){
          d3.select(this).style("opacity",".45")
          d3.select(this).style("color","#E0E0E0")
        })
        .on("mouseout",function(){
          d3.select(this).style("opacity","1")
          d3.select(this).style("color","white")
        })
        .on("click",function(d,i){
          var parent = d3.select(this)
          if(d.pages[0].name!="back"){
            d.pages.unshift({name:"back"})
          }
          parent.style("display","none")
          var subPages = d3.select(this.parentNode).selectAll("div")
            .data(d.pages)
            .enter().append("div")
            .attr("class",function(d,pageI){
              if(pageI===0){
                return colorArray[pageI] + " col-md-1 color-white homeRowPage backDiv " + offsetArray[i%3]
              }else{
                return colorArray[pageI] + " col-md-1 color-white homeRowPage"
              }
            })
            .on("mouseover",function(){
              d3.select(this).style("opacity",".45")
              d3.select(this).style("color","#E0E0E0")
            })
            .on("mouseout",function(){
              d3.select(this).style("opacity","1")
              d3.select(this).style("color","white")
            })

            subPages.filter(function(d,i){
              return i===0
            })
            .on("click",function(){
              subPages.remove()
              parent.style("display","block")
            })
            .append("i")
              .attr("class","fa fa-arrow-left fa-2x")

            subPages.filter(function(d,i){
              return i>0
            }).append("span")
              .style("margin-top","10px")
              .style("display","block")
            .append("a")
              .style("color","white")
              .attr("href",function(page){
                return page.html
              })
              .html(function(page){
                if(page.name==="Manage Databases"){
                  return "Manage Data Bases"
                }else{
                  return page.name
                }

              })
        })
        .html(function(d){
          return d.name
        })


    break;
  }
}
