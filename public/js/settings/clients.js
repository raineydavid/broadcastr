var thisPage = '/settings/clients',
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
        .style("font-family","Raleway,'Helvetica Neue',Helvetica,Arial,sans-serif")
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
          ws.send(JSON.stringify({type:"settings",id:"clients"}))
        })
      break;
      case "data":
        console.log(data)

        var sections = [{
            name:"Active Clients",
            link:"activeClients",
            fields:[
              {
                element:"table",
                elementClass:"table-striped table-hover",
                class:"table-responsive",
                data:"clients",
                transform:function(d){
                  return d.filter(function(d){
                    return d.disabled === false
                  })
                },
                action:"/settings/delete/client",
                actionFields:[
                  {
                    name:"client_id",
                    element:"input",
                    class:"hidden",
                    value:function(d){
                      return d.row[this.name]
                    }
                  },
                  {
                    name:"removeBtn",
                    element:"button",
                    class:"glyphicon glyphicon-remove-sign accentRed-500 glyph-button",
                    value:function(){

                    },
                    tooltip:"Make Client Inactive"
                  }
                ]
              }
            ]
          },{
            name:"Inactive Clients",
            link:"inactiveClients",
            fields:[
              {
                element:"table",
                elementClass:"table-striped table-hover",
                class:"table-responsive",
                data:"clients",
                transform:function(d){
                  return d.filter(function(d){
                    return d.disabled === true
                  })
                },
                action:"/settings/activate/client",
                actionFields:[
                  {
                    name:"client_id",
                    element:"input",
                    class:"hidden",
                    value:function(d){
                      return d.row[this.name]
                    }
                  },
                  {
                    name:"removeBtn",
                    element:"button",
                    class:"glyphicon glyphicon-ok-sign accentGreen-500 glyph-button",
                    value:function(){

                    },
                    tooltip:"Make Client Active"
                  }
                ]
              }
            ]
          },{
            name:"New Client",
            link:"newClient",
            type:"form",
            action:"/settings/add/client",
            fields:[
              {
                name:"client_name",
                label:"Client Name",
                element:"input",
                type:"text",
                class:"col-xs-4 form-group",
                elementClass:"form-control"
              },
              {
                name:"lead",
                label:"Lead",
                element:"select",
                dataTransform:function(d){
                  return d
                },
                options:"twoseventy-users",
                class:"col-xs-4 form-group",
                elementClass:"form-control"
              },
              {
                name:"submit",
                label:"Submit",
                element:"button",
                type:"submit",
                class:"col-xs-2 save-btn",
                elementClass:"btn btn-default logoLightBlue-bg-500"
              }
            ]
          }],
        tableDisplay = [
          {
            name:"active",
            label:null,
            width: "2%"
          },
          {
            name:"client_id",
            element:"input",
            type:"text",
            class:"col-xs-4 form-group hidden",
            elementClass:"form-control"
          },
          {
            name:"name",
            label:"Client Name",
            width: "40%",
            element:"input",
            type:"text",
            class:"col-md-4 form-group",
            elementClass:"form-control",
            modalTarget:"#editModal",
            id:"client_id"
          },
          {
            name:"twoseventy_lead",
            label:"270 Lead",
            width: "28%",
            element:"select",
            class:"col-md-4 form-group",
            elementClass:"form-control",
            dataTransform:function(d,e){
              return d.map(function(user){
                user.selected = (e["twoseventy_lead_id"]===user.value)
                return user
              })
            }
          },
          {
            name:"created_at",
            label:"Created At",
            width: "15%"
          },
          {
            name:"created_by",
            label:"Created By",
            width: "15%"
          },
          {
            name:"saveChanges",
            label:"Save Changes",
            element:"button",
            type:"submit",
            class:"col-xs-2 modal-btn",
            elementClass:"btn btn-default logoLightBlue-bg-500"
          }],
          modals = [
            {
              id:"editModal",
              header:"Edit Client",
              class:"modal-dialog modal-sm",
              width:"60%",
              idField:"id",
              filter:function(d,id){
                return d.clients.filter(function(client){
                  return client.client_id === id
                })[0]
              },
              bodyElements:[
                {
                  element:"form",
                  class:"form-inline",
                  header:"Client Details",
                  action:"/settings/update/client?redirect=clients&id=client_id",
                  fields:tableDisplay.filter(function(d){
                    return d.element
                  })
                },
                {
                  element:"form",
                  class:"form-inline",
                  header:"Add User Access",
                  action:"/settings/add/user-client?redirect=clients&id=client_id",
                  fields:[
                    {
                      name:"user",
                      label:"User",
                      element:"select",
                      class:"col-md-4 form-group",
                      elementClass:"form-control",
                      dataTransform:function(options,users){
                        return options.filter(function(option){
                          return users.users.map(function(user){
                            return parseInt(user.user_id)
                          }).indexOf(parseInt(option.value))===-1
                        })
                      }
                    },
                    {
                      name:"client_id",
                      element:"input",
                      type:"text",
                      class:"col-xs-4 form-group hidden",
                      elementClass:"form-control"
                    },
                    {
                      name:"addUser",
                      label:"Add User",
                      element:"button",
                      type:"submit",
                      class:"col-xs-2 modal-btn",
                      elementClass:"btn btn-default logoLightBlue-bg-500"
                    }
                  ]
                },
                {
                  element:"table",
                  class:"table-responsive table-striped table-hover",
                  header:"Current Users",
                  data:"users",
                  transform:function(d){
                    return d.filter(function(user){
                      return user.user_id!=null
                    })
                  },
                  action:"/settings/delete/user-client?redirect=clients&id=client_id",
                  buttonClass:"glyphicon glyphicon-remove-sign accentRed-500 glyph-button",
                  tooltip:"Remove User",
                  display:[
                    {
                      name:"active",
                      label:null,
                      width: "1%"
                    },
                    {
                      name:"name",
                      label:"Name",
                      width: "49%"
                    },
                    {
                      name:"email",
                      label:"Email",
                      width: "50%"
                    }
                  ],
                  tableForms:[
                    {
                      name:"client_id",
                      element:"input",
                      class:"hidden",
                      value:function(d){
                        return d.editId
                      }
                    },
                    {
                      name:"user_id",
                      element:"input",
                      class:"hidden",
                      value:function(d){
                        return d.parentData.row[this.name]
                      }
                    },
                    {
                      name:"removeBtn",
                      element:"button",
                      class:"glyphicon glyphicon-remove-sign accentRed-500 glyph-button",
                      value:function(d){

                      }
                    }
                  ]
                }
              ],
              buttonText:"Save Edits"
            }
          ]

          var modalContent = d3.select("body")
              .append("div")
                .attr("class","modalDiv")
              .selectAll("div")
                .data(modals)
                .enter().append("div")
                .attr("class","modal fade")
                .attr("id",function(d){
                  return d.id
                })
                .attr("tabindex","-1")
                .attr("role","dialog")
                .attr("aria-labelledby","modal")
                .append("div")
                  .attr("class",function(d){
                    return d.class
                  })
                  .style("width",function(d){
                    return d.width
                  })
                  .attr("role","document")
                .append("div")
                  .attr("class","modal-content"),
              modalHeader = modalContent.append("div")
                    .attr("class","modal-header"),
              modalTitle = modalHeader.append("h3")
                      .attr("class","modal-title logoDarkBlue-500")
                      .text(function(d){
                        return d.header
                      }),
              modalClose = modalHeader.append("button")
                    .attr("type","button")
                    .attr("class","close")
                    .attr("data-dismiss","modal")
                    .append("span")
                      .html("&times"),
              modalBody = modalContent.append("div")
                .attr("class","modal-body clearfix")
                .style("padding-top","0px")
                .selectAll("div")
                  .data(function(d){
                    return d.bodyElements
                  })
                  .enter().append("div")
                    .attr("class","row col-xs-12")

              modalBody.append("h4")
                .text(function(d){
                  return d.header
                })
              modalBody.append(function(d){
                  return document.createElement(d.element)
                })
                  .attr("class",function(d){
                    return d.class
                  })

              modalFormDivs = modalBody.filter(function(d){
                return d.element === "form"
              }).selectAll("form")
                .attr("action",function(d){
                  return d.action
                })
                .attr("method","post")
                .selectAll("div")
                  .data(function(d){
                    return d.fields
                  })
                  .enter().append("div")
                    .attr("class",function(d){
                      return d.class
                    })

              modalFormDivs.filter(function(d){
                return d.element!="button"
              }).append("label")
                .attr("for",function(d){
                  return d.name
                })
                .text(function(d){
                  return d.label
                })

              modalFormDivs.append(function(d){
                return document.createElement(d.element)
              })
                .attr("type",function(d){
                  return d.type
                })
                .attr("class",function(d){
                  return d.elementClass
                })

              modalFormDivs.filter(function(d){
                return d.element==="button"
              })
                .selectAll("button")
                  .attr("value",function(d){
                    return d.value
                  })
                  .text(function(d){
                    return d.label
                  })

            modalBody.filter(function(d){
              return d.element === "table"
                  }).selectAll("table")
                .style("width","100%")
              .append("thead")
                .append("tr")
                .selectAll("th")
                  .data(function(d){
                    return d.display.filter(function(d){
                      return d.width
                    })
                  })
                  .enter().append("th")
                  .attr("width",function(d){
                    return d.width
                  })
                  .text(function(d){
                    return d.label
                  })
                  .attr("id",function(d){
                    return d.name
                  })


          var contentDiv = d3.select("body").append("div")
            .attr("class","container-fluid")
            .append("div")
              .attr("class","row")

          var textCol = contentDiv.append("div")
            .attr("class","col-md-3")

          textCol.append("h3")
            .text("Clients")

          textCol.append("div")
            .attr("class","row col-xs-12")
            .text("Edit current clients or add a new one.")

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

            var formFields = menuPages.append("form")
              .attr("class","form-inline")
              .attr("action",function(d){
                return d.action
              })
              .attr("method","post")
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

          tables.selectAll("table")
            .style("width","100%")
          .append("thead")
            .append("tr")
            .selectAll("th")
              .data(tableDisplay.filter(function(d){
                return d.width
              }))
              .enter().append("th")
              .attr("width",function(d){
                return d.width
              })
              .text(function(d){
                return d.label
              })
              .attr("id",function(d){
                return d.name
              })

          tables.selectAll("table").append("tbody")
            .selectAll("tr")
            .data(function(d){
              return d.transform(data[d.data]).map(function(row){
                return {data:row,table:d}
              })
            })
            .enter().append("tr")
            .selectAll("td")
              .data(function(row){
                return tableDisplay.filter(function(d){
                  return d.width
                }).map(function(col){
                  return {table:row.table,row:row.data,col:col,val:row.data[col.name]}
                })
              })
              .enter().append("td")
                .attr("width",function(d){
                  return d.col.width
                })
                .append("div")
                  .style("float","left")
                  .style("text-overflow","ellipsis")
                  .style("overflow","hidden")
                  .style("white-space","nowrap")
                  .style("max-width",function(){
                    return d3.select(this).node().parentElement.getBoundingClientRect().width-15 + "px"
                  })
                  .attr("class",function(d){
                    if(d.col.modalTarget){return "modalLink logoDarkBlue-500"}
                  })
                  .attr("data-toggle",function(d){
                    if(d.col.modalTarget){return "modal"}
                  })
                  .attr("data-target",function(d){
                    if(d.col.modalTarget){return d.col.modalTarget}
                  })
                  .attr("data-id",function(d){
                    if(d.col.modalTarget){return d.row[d.col.id]}
                  })
                  .text(function(d){
                    return d.val
                  })
    /*
            fields.selectAll(".helpIcon")
              .append("i")
                .attr("class","fa fa-question-circle")
                .on("mousemove",function(d){
                  tooltipDisplay(d.tooltip)
                })
                .on("mouseout",function(d){
                  tooltipHide()
                })
    */
    $('#editModal').on('show.bs.modal', function (event) {
      var modalData = d3.select(this).data()[0],
          button = $(event.relatedTarget),
          editId = button.data('id'),
          editData = modalData.filter(data,editId)

      d3.select("#editModal").selectAll("input")
        .attr("name",function(d){
          return d.name
        })
        .attr("value",function(d){
          return editData[d.name]
        })

      d3.select("#editModal").selectAll("select")
        .attr("name",function(d){
          return d.name
        })
      .selectAll("option")
          .data(function(d){
            return d.dataTransform(data[d.name],editData)
          })
          .enter().append("option")
          .text(function(d){
            return d.text
          })
          .attr("value",function(d){
            return d.value
          })
          .attr("selected",function(d){
            if(d.selected){
                return d.selected
            }
          })

      d3.select("#editModal").selectAll("table").select("tbody").remove()
      d3.select("#editModal").selectAll("table").append("tbody")
        .selectAll("tr")
        .data(function(d){
          return d.transform(editData[d.data]).map(function(row){
            return {data:row,table:d}
          })
        })
        .enter().append("tr")
        .selectAll("td")
          .data(function(row){
            return row.table.display.filter(function(d){
              return d.width
            }).map(function(col){
              return {table:row.table,row:row.data,col:col,val:row.data[col.name]}
            })
          })
          .enter().append("td")
            .attr("width",function(d){
              return d.col.width
            })
            .append("div")
              .style("float","left")
              .style("text-overflow","ellipsis")
              .style("overflow","hidden")
              .style("white-space","nowrap")
              .style("max-width",function(){
                return d3.select(this).node().parentElement.getBoundingClientRect().width-15 + "px"
              })
              .text(function(d){
                return d.val
              })

          var tableForms = d3.select("#editModal").selectAll("tbody").selectAll("tr").selectAll("td").filter(function(d){
            return d.col.name==="active" && d.row.user_id!=editData["twoseventy_lead_id"] && d.row.user_id!=data.me.user_id
          }).append("form")
            .attr("action",function(d){
              return d.table.action
            })
            .attr("method","POST")
            .style("margin-bottom","0px")

            tableForms.selectAll("div")
              .data(function(d){
                return d.table.tableForms.map(function(tableForm){
                  var newForm = new Object;
                      Object.assign(newForm,tableForm)
                      newForm.parentData = d
                      newForm.editId = editId
                  return newForm
                })
              }).enter().append("div")
              .append(function(d){
                return document.createElement(d.element)
              })
              .attr("name",function(d){
                return d.name
              })
              .attr("class",function(d){
                return d.class
              })
              .attr("value",function(d){
                return d.value(d)
              })
              .on('mousemove', function(d) {
                tooltipDisplay(d.parentData.table.tooltip)
              })
              .on('mouseout', function(d) {
                tooltipHide()
              })
    })

    $.bootstrapSortable(true);

    if(initial_id!=undefined){
      var relatedTarget = tables.selectAll("tr").filter(function(d){
          if(d){
            return parseInt(d.data.client_id) === parseInt(initial_id)
          }
        }).selectAll("td").filter(function(d){
          return d.col.modalTarget
        }).select("div")

      $('#editModal').modal('show',$(relatedTarget.node()))

    }

    if(location.hash==="#error"){
      error(d3.select("body"))
    }

    var tableForms = tables.selectAll("tbody").selectAll("td").filter(function(d){
      return d.col.name==="active"
    }).append("form")
      .attr("action",function(d){
        return d.table.action
      })
      .attr("method","POST")
      .style("margin-bottom","0px")
      .selectAll("div")
        .data(function(d){
          return d.table.actionFields.map(function(field){
            var newField = new Object;
                Object.assign(newField,field)
                newField.parentData = d
            return newField
          })
        }).enter().append("div")
        .append(function(d){
          return document.createElement(d.element)
        })
          .attr("name",function(d){
            return d.name
          })
          .attr("class",function(d){
            return d.class
          })
          .attr("value",function(d){
            return d.value(d.parentData)
          })
          .on('mousemove', function(d) {
            tooltipDisplay(d.tooltip)
          })
          .on('mouseout', function(d) {
            tooltipHide()
          })

          break;
        }
      }
