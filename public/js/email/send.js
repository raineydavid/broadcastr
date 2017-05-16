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

var emailCheck = function(d){
  for(i=0;i<CSVToArray(d)[0].length;i++){
    if(CSVToArray(d)[0][i].indexOf("@")>-1){
      d3.select("#inputWarning").text("First row must be header names!")
      return
    }else{
      d3.select("#inputWarning").text("")
    }
  }
}

var insertAtCursor = function(myField, myValue) {
    if (myField.selectionStart || myField.selectionStart === '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        var textValue = myField.value.substring(0, startPos)
                      + myValue
                      + myField.value.substring(endPos, myField.value.length)
    } else {
        var textValue = myValue
        var endPost = myValue.length
    }

    var editorObj = $("#body").data('wysihtml5');
    var editor = editorObj.editor;
    editor.setValue(textValue);
    $("#body").focus()

}

//Page Setup

var thisPage = '/email/send',
    pageHeight = window.innerHeight,
    state = new Object,
    cols = [
      {
        name: "recipients",
        label:"Recipients",
        class:"col-md-6",
        fields:[
          {
            name:"headerSelect",
            element:"select",
            options:"headerOptions",
            label:"Headers",
            labelClass:"helpIcon",
            class:"col-xs-4 form-group",
            elementClass:"form-control",
            tooltip:"<strong>Email first followed by first name</strong><br>Separated by comma or tab (Excel copy/paste)<br>Only one person per row",
            onChange:function(d){
              var recip = d3.select("#recipients").node().value
              switch(d){
                case "default":
                  this.tooltip = "<strong>Email first followed by first name</strong><br>Separated by comma or tab (Excel copy/paste)<br>Only one person per row"
                  if(recip!=""){
                    d3.select("#recipientsCleaned").text(jsonRender(CSVToArray(recip),['email','name'],'\n'))
                    if(CSVToArray(recip)[0].length>2){
                      d3.select("#inputWarning").text("Default headers can only have a max of 2 columns. Switch to custom?")
                    }else if(CSVToArray(recip)[0][0].indexOf("@")===-1){
                      d3.select("#inputWarning").text("First column must be email!")
                    }else if(CSVToArray(recip)[0][1].indexOf("@")>-1){
                      d3.select("#inputWarning").text("Second column must be name, not email!")
                    }

                    d3.select("#mergeFields").selectAll("option")
                        .data([{text:"email",value:"|*EMAIL*|"},{text:"name",value:"|*NAME*|"}])
                        .enter().append("option")
                        .text(function(d){
                          return d.text
                        })
                        .attr("value",function(d){
                          return d.value
                        })
                    d3.select("#mergeText").attr("value","|*EMAIL*|")
                  }
                break;
                case "custom":
                  this.tooltip = "<strong>First row column titles</strong><br>Separated by comma or tab (Excel copy/paste)<br>Only one person per row";
                  if(recip!=""){
                    d3.select("#recipientsCleaned").text(jsonRender(CSVToArray(recip).slice(1),CSVToArray(recip)[0],'\n'));
                    emailCheck(recip)
                    d3.select("#mergeFields").selectAll("option")
                        .data(CSVToArray(recip)[0].map(function(merge){
                          return {text:merge,value:"|*"+merge.toUpperCase()+"*|"}
                        }))
                        .enter().append("option")
                        .text(function(d){
                          return d.text
                        })
                        .attr("value",function(d){
                          return d.value
                        })
                    d3.select("#mergeText").attr("value","|*"+CSVToArray(recip)[0][0].toUpperCase()+"*|")
                  }
                break;
              }
            }
          },
          {
            name:"inputWarning",
            label:"-",
            labelClass:"labelHide",
            element:"div",
            class:"col-xs-8 detailText accentRed-500"
          },
          {
            name:"recipients",
            element:"textarea",
            label:"List Input",
            class:"col-xs-12 form-group",
            elementClass:"form-control",
            height:pageHeight*.25+"px",
            onChange:function(d){
              if(d!=""){
                switch(d3.select("#headerSelect").node().value){
                  case "default":
                    d3.select("#recipientsCleaned").text(jsonRender(CSVToArray(d),['email','name'],'\n'));
                    if(CSVToArray(d)[0].length>2){
                      d3.select("#inputWarning").text("Default headers can only have a max of 2 columns. Switch to custom?")
                    }else if(CSVToArray(d)[0][0].indexOf("@")===-1){
                      d3.select("#inputWarning").text("First column must be email!")
                    }else if(CSVToArray(d)[0][1].indexOf("@")>-1){
                      d3.select("#inputWarning").text("Second column must be name, not email!")
                    }else{
                      d3.select("#inputWarning").text("")
                    }
                    d3.select("#mergeFields").selectAll("option")
                        .data([{text:"email",value:"|*EMAIL*|"},{text:"name",value:"|*NAME*|"}])
                        .enter().append("option")
                        .text(function(d){
                          return d.text
                        })
                        .attr("value",function(d){
                          return d.value
                        })
                    d3.select("#mergeText").attr("value","|*EMAIL*|")
                  break;
                  case "custom":
                    d3.select("#recipientsCleaned").text(jsonRender(CSVToArray(d).slice(1),CSVToArray(d)[0],'\n'));
                    emailCheck(d)
                    d3.select("#mergeFields").selectAll("option")
                        .data(CSVToArray(d)[0].map(function(merge){
                          return {text:merge,value:"|*"+merge.toUpperCase()+"*|"}
                        }))
                        .enter().append("option")
                        .text(function(d){
                          return d.text
                        })
                        .attr("value",function(d){
                          return d.value
                        })
                    d3.select("#mergeText").attr("value","|*"+CSVToArray(d)[0][0].toUpperCase()+"*|")
                  break;
                }
              }
            }
          },
          {
            name:"recipientsCleaned",
            element:"textarea",
            label:"List Preview",
            class:"col-xs-12 form-group",
            elementClass:"form-control",
            height:pageHeight*.25+"px",
            readOnly:"readOnly"
          }
        ]
      },
      {
        name: "message",
        label:"Message",
        class:"col-md-6",
        fields:[
          {
            name:"template",
            element:"select",
            options:"templates",
            label:"Template",
            labelClass:"helpIcon",
            class:"col-xs-2 form-group",
            elementClass:"form-control",
            tooltip:"Select a template for your email<br>It will overwrite any existing email in the body field below",
            onChange:function(d){

            }
          },
          {
            name:"loadTemplate",
            label:"Load Template",
            element:"button",
            type:"button",
            class:"col-md-2 buttonDiv",
            elementClass:"btn btn-default logoLightBlue-bg-500 msg-btn"
            /*onClick:function(){
              $("#previewEmail").modal()
            }*/
          },
          {
            name:"mergeFields",
            element:"select",
            options:"mergeFields",
            label:"Merge Fields",
            labelClass:"helpIcon",
            class:"col-xs-3 form-group",
            elementClass:"form-control",
            tooltip:"Merge fields are set based on the headers in the List Input section",
            onChange:function(d){
              d3.select("#mergeText").attr("value",d)
            }
          },
          {
            name:"mergeText",
            label:"Merge Text",
            labelClass:"helpIcon",
            element:"input",
            type:"text",
            readOnly:"readOnly",
            class:"col-xs-3 form-group",
            elementClass:"form-control",
            tooltip:"Copy and paste this text to merge fields into your email"
          },
          {
            name:"addMerge",
            label:"Add Text",
            element:"button",
            class:"col-md-2 buttonDiv",
            elementClass:"btn btn-default logoLightBlue-bg-500 msg-btn",
            type:"button",
            onClick:function(){
              insertAtCursor(d3.select("#body").node(),d3.select("#mergeText").node().value)
            }
          },
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
            height:pageHeight*.41+"px"
          },
          {
            name:"sendButton",
            label:"Send",
            element:"button",
            type:"submit",
            class:"col-md-1 buttonDiv bottomRow",
            elementClass:"btn btn-default logoLightBlue-bg-500"
            /*onClick:function(){
              $("#previewEmail").modal()
            }*/
          }
        ]
      }
    ],
    headerOptions =[
      {
        text:"Default",
        value:"default"
      },
      {
        text:"Custom",
        value:"custom"
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
    ws.send(JSON.stringify({type:"navbar"}))
  }

ws.onmessage = function(event){
  var dataId = JSON.parse(event.data).id
  var data = JSON.parse(event.data).data

  switch(dataId){
    case "pages":
    console.log(data)
      var body = d3.select("body")
        navBar(body,data,function(d){
          ws.send(JSON.stringify({type:"email",id:"templates"}))
        })

    break;
    case "data":
      data.headerOptions = headerOptions
      data.mergeFields = []
      var footer = d3.select("body").select("footer")

      var contentDiv = d3.select("body").append("div")
        .attr("class","container-fluid")
        .append("form")
          .attr("class","form-inline")
          .attr("method","post")
          .attr("action","/email/send")

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
            .attr("type",function(d){
              return d.type
            })
            .on("click",function(d){
              d.onClick()
            })

      fields.selectAll(".form-group")
        .append("label")
          .text(function(d){
            return d.label
          })
          .attr("class",function(d){
            return d.labelClass
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
        .attr("id",function(d){
          return d.name
        })
        .attr("readOnly",function(d){
          return d.readOnly
        })
        .on("change",function(d){
          d.onChange(this.value)
        })

      fields.selectAll("select")
        .selectAll("option")
          .data(function(d){
            return data[d.options].map(function(option){
              return {text:option.text,value:option.value}
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
          .attr("class",function(d){
            return d.labelClass
          })

      fields.selectAll(".detailText")
        .append("div")
        .attr("id",function(d){
          return d.name
        })
        .html(function(d){
          return d.text
        })

        if(location.hash==="#newUser"){
          $('#newUser').modal({
            backdrop: 'static',
            keyboard: false
          })
        }

      fields.selectAll(".helpIcon")
        .append("i")
          .attr("class","fa fa-question-circle")
          .on("mousemove",function(d){
            tooltipDisplay(d.tooltip)
          })
          .on("mouseout",function(d){
            tooltipHide()
          })

      $('#body').wysihtml5({
           "font-styles": false, //Font styling, e.g. h1, h2, etc. Default true
           "emphasis": true, //Italics, bold, etc. Default true
           "lists": true, //(Un)ordered lists, e.g. Bullets, Numbers. Default true
           "html": true, //Button which allows you to edit the generated HTML. Default false
           "link": true, //Button to insert a link. Default true
           "image": true, //Button to insert an image. Default true,
           "color": false, //Button to change color of font
           "blockquote": false, //Blockquote
           "size": 'xs' //default: none, other options are xs, sm, lg
      });

    $('.bootstrap-wysihtml5-insert-link-modal').on("shown.bs.modal",function(){
      if(d3.select(".bootstrap-wysihtml5-insert-link-modal").select(".modal-dialog").select(".modal-content").select(".modal-body").select(".alert")){

      }else{
        d3.select(".bootstrap-wysihtml5-insert-link-modal").select(".modal-dialog").select(".modal-content").select(".modal-body").append("div")
          .attr("class","col-xs-12 alert alert-danger")
          .text("Links must start with https://www. to be valid. Do not include any link sourcing, it will automatically be added to your URL.")
      }
    })

    break;
  }
}
