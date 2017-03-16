var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host)

//Page Setup

var thisPage = '/',
    pageHeight = window.innerHeight,
    state = new Object,
    cols = [
      {
        name: "recipients",
        label:"Recipients",
        class:"col-md-6",
        fields:[
          {
            name:"recipients",
            element:"textarea",
            class:"col-xs-12 form-group",
            elementClass:"form-control",
            height:pageHeight*.6+"px"
          }
        ]
      },
      {
        name: "message",
        label:"Message",
        class:"col-md-6",
        fields:[
          {
            name:"subject",
            label:"Subject",
            element:"input",
            type:"text",
            class:"col-xs-12 form-group",
            elementClass:"form-control"
          },
          {
            name:"body",
            label:"Body",
            element:"textarea",
            class:"col-xs-12 form-group",
            elementClass:"form-control",
            height:pageHeight*.45+"px"
          },
          {
            name:"sendButton",
            label:"Send",
            element:"button",
            class:"col-md-1 buttonDiv",
            elementClass:"btn btn-default logoLightBlue-bg-500"
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
    console.log(data)
      var body = d3.select("body")
        navBar(body,data,function(d){
          var footer = d3.select("body").select("footer")

          var contentDiv = d3.select("body").append("div")
            .attr("class","container-fluid")
            .append("form")
              .attr("class","form-inline")
              .attr("method","post")
              .attr("action","/send")

          var columns = contentDiv.append("div")
            .attr("class","row")
            .selectAll("div")
              .data(cols)
              .enter().append("div")
                .attr("class",function(d){
                  return d.class
                })

          columns.append("div")
            .attr("class","row col-xs-12")
            .append("h4")
              .text(function(d){
                return d.label
              })

          var fields = columns.append("div")

          fields.selectAll("div")
            .data(function(d){
              return d.fields
            })
            .enter().append("div")
            .attr("class",function(d){
              return d.class
            })

          fields.selectAll(".buttonDiv")
              .append("button")
                .attr("class",function(d){
                  return d.elementClass
                })
                .text(function(d){
                  return d.label
                })
                .attr("type","submit")

          fields.selectAll(".form-group")
            .append("label")
              .text(function(d){
                return d.label
              })

          fields.selectAll(".form-group")
            .append(function(d){
              return document.createElement(d.element)
            })
            .attr("class",function(d){
              return d.elementClass
            })
            .attr("name",function(d){
              return d.name
            })
            .attr("type",function(d){
              return d.type
            })
            .style("height",function(d){
              return d.height
            })

          fields.selectAll("select")
            .selectAll("option")
              .data(function(d){
                return data[d.options].map(function(option){
                  return {text:option.text,value:option.value,selected:card.data[d.name]}
                })
              })
              .enter().append("option")
              .text(function(d){
                return d.text
              })
              .attr("value",function(d){
                return d.value
              })
              .attr("selected",function(d){
                if(d.value===d.selected){
                  return "selected"
                }
              })

          fields.selectAll(".detailText")
            .append("label")
              .text(function(d){
                return d.label
              })

          fields.selectAll(".detailText")
            .append("div")
            .text(function(d){
              return d.format(card[d.name])
            })
        })

        if(location.hash==="#newUser"){
          $('#newUser').modal('show')
        }

    break;
  }
}
