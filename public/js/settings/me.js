var thisPage = '/account/me',
    pageHeight = window.innerHeight,
    state = new Object,
    colorArray = ["logoLightBlue-bg-500","accentGreen-bg-500","accentYellow-bg-500","accentRed-bg-500"],
    textColorArray = ["color-white","gray-400","gray-600","gray-900","black"],
    offsetArray = ["col-md-offset-2","",""];

var getUrlParameter = function getUrlParameter(path,sParam) {
    var sPageURL = path,
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var dateFormat = function(date){
  var splitDate = date.split("/")
  return "20"+splitDate[2]+"-"+splitDate[0]+"-"+splitDate[1]
}

var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host),
    path = location.search.substring(1),
    initial_id = getUrlParameter(path,"id")

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
    ws.send(JSON.stringify({type:"navbar"}))
  }

  ws.onmessage = function (event) {
    var dataId = JSON.parse(event.data).id
    var data = JSON.parse(event.data).data
    switch(dataId){
      case "pages":
        console.log(data)
        navBar(d3.select("body"),data,function(done){
          ws.send(JSON.stringify({type:"settings",id:"me"}))
        })
      break;
      case "data":
        console.log(data)

        var sections = [{
            name:"My Account",
            link:"myAccount",
            fields:[
              {
                element:"form",
                action:"/settings/update/user?redirect=me",
                class:"form-inline",
                method:"post",
                fields:[
                  {
                    name:"user_id",
                    element:"input",
                    class:"hidden",
                    value:function(d){
                      return d.row[this.name]
                    }
                  },
                  {
                    name:"fname",
                    label:"First Name",
                    element:"input",
                    type:"text",
                    class:"col-xs-4 form-group",
                    elementClass:"form-control"
                  },
                  {
                    name:"lname",
                    label:"Last Name",
                    element:"input",
                    type:"text",
                    class:"col-xs-4 form-group",
                    elementClass:"form-control"
                  },
                  {
                    name:"email",
                    label:"Email",
                    element:"input",
                    type:"text",
                    class:"col-xs-4 form-group",
                    elementClass:"form-control"
                  },
                  {
                    name:"submit",
                    label:"Save Changes",
                    element:"button",
                    type:"submit",
                    class:"col-xs-2 save-btn",
                    elementClass:"btn btn-default logoLightBlue-bg-500"
                  }
                ]
              },
              {
                element:"form",
                class:"form-inline",
                action:"/password_reset",
                method:"post",
                fields:[
                  {
                    name:"email",
                    element:"input",
                    class:"hidden",
                    value:function(d){
                      return d.row[this.name]
                    }
                  },
                  {
                    name:"submit",
                    label:"Reset Password",
                    element:"button",
                    type:"submit",
                    class:"col-xs-2 save-btn",
                    elementClass:"btn btn-default logoDarkBlue-bg-500"
                  }
                ]
              }
            ]
          }]

      var contentDiv = d3.select("body").append("div")
        .attr("class","container-fluid")
        .append("div")
          .attr("class","row")

      var textCol = contentDiv.append("div")
        .attr("class","col-md-3")

      textCol.append("h3")
        .text("Users")

      textCol.append("div")
        .attr("class","row col-xs-12")
        .text("Edit current users or add a new one.")

      var menuCol = contentDiv.append("div")
        .attr("class",'col-md-9 row'),
      menuNav = menuCol.append("div")
        .attr("class",'navigation col-md-3')
        .attr("role","navigation"),
      menuPages = menuCol.append("div")
        .attr("class","tab-content col-md-9")
        .selectAll("div")
          .data(sections)
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
            return "tab-"+d.link
          })
          .style("margin-left","5%")

      menuNav.append("ul")
      .attr("class","nav nav-pills nav-stacked")
      .attr("role","tablist")
      .style("width","100%")
        .selectAll("li")
        .data(sections)
        .enter().append("li")
          .attr("class",function(d,i){
            if(i===0){
              state.pageRoot = d.link
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
            if(state.pageRoot!=d.link){
              state.pageRoot = d.link
              d3.select(".pageRoot.active").transition(t).style("width",d3.select(".pageRoot.active").node().getBoundingClientRect().width*(1/1.2)+"px")
              d3.select(this).transition(t).style("width",this.getBoundingClientRect().width*1.2+"px")
            }
          })
        .append("a")
          .attr("href",function(d){return "#tab-"+d.link})
          .attr("data-toggle","pill")
          .text(function(d){return d.name})

        var formFields = menuPages.append("div")
          .selectAll("div")
            .data(function(d){
              return d.fields
            })
            .enter().append("div")
            .append(function(d){
              return document.createElement(d.element)
            })
            .attr("action",function(d){
              return d.action
            })
            .attr("method",function(d){
              return d.method
            })
            .attr("class",function(d){
              return d.class
            })
          .selectAll("div")
            .data(function(d){
              return d.fields
            })
            .enter().append("div")
              .attr("class",function(d){
                return d.class
              })
              .attr("name",function(d){
                return d.name
              }),
        inputs = formFields.filter(function(d){
          return d.element === "input"
        }),
        selects = formFields.filter(function(d){
          return d.element === "select"
        }),
        buttons = formFields.filter(function(d){
          return d.element === "button"
        }),
        tables = formFields.filter(function(d){
          return d.element === "table"
        })

        formFields.filter(function(d){
          return d.element!="button" && d.element!="table"
        }).append("label")
          .attr("for",function(d){
            return d.name
          })
          .text(function(d){
            return d.label
          })
          .style("color","black")

        formFields.append(function(d){
          return document.createElement(d.element)
        })
          .attr("class",function(d){
            return d.elementClass
          })
          .attr("type",function(d){
            return d.type
          })

        inputs.selectAll("input")
          .attr("value",function(d){
            return data[d.name]
          })
          .attr("name",function(d){
            return d.name
          })

        selects.selectAll("select")
          .attr("name",function(d){
            return d.name
          })
        .selectAll("option")
            .data(function(d){
              return d.dataTransform(data[d.name])
            })
            .enter().append("option")
            .text(function(d){
              return d.text
            })
            .attr("value",function(d){
              return d.value
            })

        buttons.selectAll("button")
          .attr("value",function(d){
            return d.value
          })
          .text(function(d){
            return d.label
          })

        window.onload = function(){
          var max = 0
          buttons.selectAll("button").each(function(d){
            if(this.getBoundingClientRect().width>max){
              max = this.getBoundingClientRect().width
            }
          })
          buttons.selectAll("button")
            .style("width",max+"px")
        }
}
}
