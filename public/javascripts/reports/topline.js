var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host)

var arrayToObjects = function(input,headers){
  var array = new Array
  input.forEach(function(row){
    var output = new Object

    row.forEach(function(col,i){
      output[headers[i]] = col
    })

    array.push(output)
  })
  return array
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

var toDate = function(d){
  return d3.timeParse("%Y-%m-%d")(d)
}

//Page Setup

var thisPage = '/reports/toplines',
    pageHeight = window.innerHeight,
    state = new Object,
    rows = [
      {
        name:"totals",
        cols:[
          {
            name:"toplines",
            class:"col-md-4 col-md-offset-4 table-responsive",
            element:"table",
            elementClass:"table table-condensed table-hover center totalsTable",
            dataKey:"totals",
            tableTransform:function(raw){
              var filterData = raw.filter(function(d){
                return d.sender_id === state.sender_id
              })[0]
              return Object.keys(filterData).filter(function(d){
                  return d!="sender_id"
              }).map(function(d){
                  return [{name:"header",val:d,width:"75%"},{name:"metric",val:filterData[d],width:"25%"}]
              })
            }
          },
          {
            name:"sender_id",
            class:"col-md-2 form-group",
            label:"User",
            element:"select",
            elementClass:"form-control",
            options:"users",
            tableTransform:function(raw,val){
              var filterData = raw.filter(function(d){
                return d.sender_id === val
              })[0]
              return Object.keys(filterData).filter(function(d){
                  return d!="sender_id"
              }).map(function(d){
                  return [{name:"header",val:d,width:"75%"},{name:"metric",val:filterData[d],width:"25%"}]
              })
            },
            data:function(raw){
              return raw.map(function(d){
                return {text:d.sender_email,val:d.sender_id}
              })
            },
            onChange:function(val,data){
              d3.select(".totalsTable").select("tbody").selectAll("tr").remove()
              d3.select(".totalsTable").select("tbody").selectAll("tr")
                .data(this.tableTransform(data.totals,val))
                .enter().append("tr")
                .selectAll("td")
                  .data(function(d){
                    return d
                  })
                  .enter().append("td")
                  .attr("class",function(d){
                    return d.name
                  })
                  .attr("width",function(d){
                    return d.width
                  })
                  .text(function(d){
                    return d.val
                  })

                  var rects = d3.select("#timeGraph").select("chart").select("svg").select("g").selectAll("rect")
                    .data(function(d){
                      console.log(d.dataTransform(data[d.data]).map(function(bar){
                        return {
                          data:bar,
                          x:d.x(data[d.data],d.staticWidth,d.xField)(d.xFormat(bar[d.xField])),
                          y:d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                          height:d.staticHeight-d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                          width:d.x(data[d.data],d.staticWidth,d.xField).bandwidth(),
                          tooltip:d.tooltip(bar,state[d.yFilter])
                        }
                      }))
                      return d.dataTransform(data[d.data]).map(function(bar){
                        return {
                          data:bar,
                          x:d.x(data[d.data],d.staticWidth,d.xField)(d.xFormat(bar[d.xField])),
                          y:d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                          y0:d.y(data[d.data],state[d.yFilter],d.staticHeight)(0),
                          height:d.staticHeight-d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                          width:d.x(data[d.data],d.staticWidth,d.xField).bandwidth(),
                          tooltip:d.tooltip(bar,state[d.yFilter])
                        }
                      })
                    }),
                    t = d3.transition()
                            .duration(750)

                  d3.select("#timeGraph").selectAll(".y.axis")
                    .each(function(d){
                      d3.select(this)
                      .transition(t)
                      .call(d3.axisLeft().scale(d.y(data[d.data],state[d.yFilter],d.staticHeight)))
                    })

                  rects.exit()
                    .transition(t)
                      .attr("y",function(d){
                        return d.y0
                      })
                      .attr("height",0)
                      .remove()

                  rects.attr("x",function(d){
                    return d.x
                  }).transition(t)
                      .attr("height",function(d){
                        return d.height
                      })
                      .attr("y",function(d){
                        return d.y
                      })

                  rects.enter().append("rect")
                      .attr("class","bar")
                    .attr("x",function(d){
                      return d.x
                    })
                    .attr("width",function(d){
                      return d.width
                    })
                    .attr("y",function(d){
                      return d.y0
                    })
                    .attr("height",function(d){
                      return 0
                    })
                    .on("mousemove",function(d){
                      tooltipDisplay(d.tooltip)
                    })
                    .on("mouseout",function(){
                      tooltipHide()
                    })
                    .transition(t)
                      .attr("height",function(d){
                        return d.height
                      })
                      .attr("y",function(d){
                        return d.y
                      })
            }
          }
        ]
      },
      {
        name:"timeSeries",
        cols:[
          {
            name:"timeGraph",
            class:"col-md-8 col-md-offset-2 timeSeries",
            element:"chart",
            data:"timeSeries",
            dataFilter:"sender_id",
            yFilter:"metricDD",
            xField:"send_date",
            xFormat:function(d){
              return toDate(d)
            },
            tooltip:function(d,metric){
              return "<strong>Week:</strong> "+d.send_date+"<br><strong>"+metric+":</strong> "+d[metric]
            },
            margins:{
              top:10,
              right:20,
              bottom:75,
              left:60
            },
            width:function(){
              return d3.select("#"+this.name).node().getBoundingClientRect().width
            },
            height:function(){
              return window.innerHeight-d3.select("nav").node().getBoundingClientRect().height-d3.select("footer").node().getBoundingClientRect().height-d3.select("#contentDiv").node().getBoundingClientRect().height
            },
            x:function(domainData,staticWidth,xField){
              return d3.scaleBand()
                .rangeRound([0,staticWidth],.1)
                .padding(.1)
                .align(.1)
                .domain(d3.timeDays(toDate(domainData[0][xField]),toDate(domainData[domainData.length-1][xField])))
            },
            xAxis:function(domainData,staticWidth,xField){
              var x = this.x
              return d3.axisBottom()
                .scale(x(domainData,staticWidth,xField))
                .ticks(10)
                .tickFormat(d3.timeFormat('%m/%d/%y'))
            },
            y:function(domainData,val,staticHeight){
              return d3.scaleLinear()
                .rangeRound([staticHeight,0])
                .domain([0,d3.max(domainData,function(d){return parseFloat(d[val])})])
            },
            yAxis:function(domainData,val,staticHeight){

            },
            dataTransform:function(raw){
              dataFilter = this.dataFilter
              return raw.filter(function(d){
                return d[dataFilter] === state[dataFilter]
              })
            }
          },
          {
            name:"metricDD",
            class:"col-md-2 form-group",
            element:"select",
            label:"Metric",
            elementClass:"form-control",
            options:"timeSeries",
            ref:"timeGraph",
            data:function(raw){
              return Object.keys(raw[0]).filter(function(d){
                return d!="send_date" && d!="sender_id"
              }).map(function(d,i){
                if(i===0){state[this.name]}
                return {text:toTitleCase(d.replace('_',' ')),val:d}
              })
            },
            onChange:function(val,data){
              var rects = d3.select("#timeGraph").select("chart").select("svg").select("g").selectAll("rect")
                .data(function(d){
                  return d.dataTransform(data[d.data]).map(function(bar){
                    return {
                      data:bar,
                      x:d.x(data[d.data],d.staticWidth,d.xField)(d.xFormat(bar[d.xField])),
                      y:d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                      y0:d.y(data[d.data],state[d.yFilter],d.staticHeight)(0),
                      height:d.staticHeight-d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                      width:d.x(data[d.data],d.staticWidth,d.xField).bandwidth(),
                      tooltip:d.tooltip(bar,state[d.yFilter])
                    }
                  })
                }),
                t = d3.transition()
                        .duration(750)

              d3.select("#timeGraph").selectAll(".y.axis")
                .each(function(d){
                  d3.select(this)
                  .transition(t)
                  .call(d3.axisLeft().scale(d.y(data[d.data],state[d.yFilter],d.staticHeight)))
                })

                rects.exit()
                  .transition(t)
                    .attr("y",0)
                    .remove()

                rects.transition(t)
                    .attr("height",function(d){
                      return d.height
                    })
                    .attr("y",function(d){
                      return d.y
                    })

                rects.enter().append("rect")
                    .attr("class","bar")
                  .attr("x",function(d){
                    return d.x
                  })
                  .attr("width",function(d){
                    return d.width
                  })
                  .attr("y",function(d){
                    return d.y0
                  })
                  .attr("height",function(d){
                    return 0
                  })
                  .on("mousemove",function(d){
                    tooltipDisplay(d.tooltip)
                  })
                  .on("mouseout",function(){
                    tooltipHide()
                  })
                  .transition(t)
                    .attr("height",function(d){
                      return d.height
                    })
                    .attr("y",function(d){
                      return d.y
                    })
            }
          }
        ]
      }
    ]

//Date Format Function

var dateFormat = function(date){
  var splitDate = date.split("/")
  return "20"+splitDate[2]+"-"+splitDate[0]+"-"+splitDate[1]
}

//MODALS

var modalContent = d3.select("body").append("div").append("div")
    .attr("class","modal fade")
    .attr("id","newUser")
    .attr("tabindex","-1")
    .attr("role","dialog")
    .attr("aria-labelledby","modal")
    .append("div")
      .attr("class","modal-dialog modal-sm")
      .attr("role","document")
      .style("width","30%")
    .append("div")
      .attr("class","modal-content")

var modalBody = modalContent.append("div")
  .attr("class","modal-body clearfix")
  .style("padding-top","0px")
  .style("text-align","center")

modalBody.append("h2")
  .attr("class","modal-title logoLightBlue-500")
  .attr("id","modalHeader")
  .style("margin-bottom","5px")
  .text("Welcome to Echo!")

modalBody.append("div")
  .attr("class","row col-xs-12")
  .style("margin-bottom","20px")
  .text("Echo is a tool to help you have one-on-one conversations with grassroots supporters over email.")

modalBody.append("div")
  .attr("class","row col-xs-12")
  .style("margin-bottom","20px")
  .text("We connect to your email account to send emails as you, and supporters can reply directly to your inbox to start a conversation.")

modalBody.append("div")
  .attr("class","row col-xs-12")
  .style("margin-bottom","20px")
  .text("Click the button below to connect your email account and get started!")

modalBody.append("div")
  .attr("class","row")
  .append("div")
    .attr("class","buttonDiv col-xs-12")
      .append("button")
        .attr("class","btn btn-default logoLightBlue-bg-500")
        .text("Connect My Email")
        .style("margin","auto")
        .on("click",function(){
          window.location.replace('/gm/auth/url')
        })

//Tooltip

var tooltipDisplay = function tooltipDisplay(msg){
  tooltip.style('opacity', .9)
    .style("display","block")
  tooltip.html(msg)

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
    console.log(data)
      var body = d3.select("body")
        navBar(body,data,function(d){
          ws.send(JSON.stringify({type:"reports",id:"topline"}))
        })

    break;
    case "data":
      console.log(data)
      state.sender_id = data.users[0].sender_id
      state.metricDD = "sends"
      var footer = d3.select("body").select("footer")

      var contentDiv = d3.select("body").append("div")
        .attr("class","container-fluid")
        .attr("id","contentDiv")

      var rowDivs = contentDiv.selectAll("div")
                    .data(rows)
                    .enter().append("div")
                      .attr("class","row"),
          colDivs = rowDivs.selectAll("div")
                  .data(function(d){
                    return d.cols
                  })
                  .enter().append("div")
                    .attr("class",function(d){
                      return d.class
                    })
                    .attr("id",function(d){
                      return d.name
                    }),
          labels = colDivs.append("label")
                    .text(function(d){
                      return d.label
                    })
          elems = colDivs.append(function(d){
                    return document.createElement(d.element)
                  })
                    .attr("class",function(d){
                      return d.elementClass
                    }),
          tables = elems.filter(function(d){return d.element==="table"}),
          selects = elems.filter(function(d){return d.element==="select"}),
          charts = elems.filter(function(d){return d.element==="chart"})

          tables.append("tbody")
            .selectAll("tr")
            .data(function(d){
              return d.tableTransform(data[d.dataKey])
            })
            .enter().append("tr")
            .selectAll("td")
              .data(function(d){
                return d
              })
              .enter().append("td")
              .attr("class",function(d){
                return d.name
              })
              .attr("width",function(d){
                return d.width
              })
              .text(function(d){
                return d.val
              })

            selects.on("change",function(d){
              state[d.name] = this.value
              d.onChange(this.value,data)
            })

            selects.selectAll("option")
              .data(function(d){
                return d.data(data[d.options])
              })
              .enter().append("option")
              .text(function(d){
                return d.text
              })
              .attr("value",function(d){
                return d.val
              })

            var svgs = charts.append("svg")
              .attr("height",function(d){
                d.staticHeight = d.height()
                return d.height()+d.margins.bottom+d.margins.top
              })
              .attr("width",function(d){
                d.staticWidth = d.width()-d.margins.left-d.margins.right
                return d.width()+d.margins.left+d.margins.right
              })
              .append("g")
                .attr("transform",function(d){
                  return "translate("+d.margins.left+","+d.margins.top+")"
                })

            svgs.append("g")
              .attr("class","x axis")
              .attr("transform",function(d){
                return "translate(0," + (d.staticHeight) +  ")"
              })
              .each(function(d){
                d3.select(this).call(d.xAxis(data[d.data],d.staticWidth,d.xField))
              })

            svgs.append("g")
              .attr("class", "y axis")
              .attr("transform","translate(-20,0)")
              .each(function(d){
                d3.select(this).call(d3.axisLeft().scale(d.y(data[d.data],state[d.yFilter],d.staticHeight)))
              })

            t = d3.transition()
                    .duration(750)

            svgs.selectAll("rect")
              .data(function(d){
                return d.dataTransform(data[d.data]).map(function(bar){
                  return {
                    data:bar,
                    x:d.x(data[d.data],d.staticWidth,d.xField)(d.xFormat(bar[d.xField])),
                    y:d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                    y0:d.y(data[d.data],state[d.yFilter],d.staticHeight)(0),
                    height:d.staticHeight-d.y(data[d.data],state[d.yFilter],d.staticHeight)(parseFloat(bar[state[d.yFilter]])),
                    width:d.x(data[d.data],d.staticWidth,d.xField).bandwidth(),
                    tooltip:d.tooltip(bar,state[d.yFilter])
                  }
                })
              })
              .enter().append("rect")
                .attr("class","bar")
              .attr("x",function(d){
                return d.x
              })
              .attr("width",function(d){
                return d.width
              })
              .on("mousemove",function(d){
                tooltipDisplay(d.tooltip)
              })
              .on("mouseout",function(){
                tooltipHide()
              })
              .attr("y",function(d){
                return d.y0
              })
              .attr("height",function(d){
                return 0
              })
              .transition(t)
                .attr("y",function(d){
                  return d.y
                })
                .attr("height",function(d){
                  return d.height
                })

    break;
  }
}
