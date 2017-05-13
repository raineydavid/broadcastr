var thisPage = '/users/new'

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

var host = location.origin.replace(/^http/, 'ws'),
    ws = new WebSocket(host),
    path = location.search.substring(1)

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

var errorModalContent = d3.select("body").append("div")
  .attr("class","modal fade")
  .attr("id","error")
  .attr("tabindex","-1")
  .attr("role","dialog")
  .attr("aria-labelledby","modal")
  .append("div")
    .attr("class","modal-dialog")
    .attr("role","document")
  .append("div")
    .attr("class","modal-content")

var errorModalHeaderDiv = errorModalContent.append("div")
      .attr("class","modal-header")

var errorModalHeader = errorModalHeaderDiv.append("div").append("h3")
    .attr("class","modal-title logoLightBlue-500")
    .attr("id","myModalLabel")

var errorModalBody = errorModalContent.append("div")
  .attr("class","modal-body clearfix")
  .style("padding-top","0px")

var errorAlert = errorModalBody.append("div")
  .attr("class","alert alert-danger")
  .attr("role","alert")

var errorModalFooter = errorModalContent.append("div")
  .attr("class","modal-footer")

  errorModalFooter.append("button")
      .attr("class","btn btn-default")
      .attr("data-dismiss",'modal')
      .text("Go Back")

var warningModalContent = d3.select("body").append("div")
  .attr("class","modal fade")
  .attr("id","warning")
  .attr("tabindex","-1")
  .attr("role","dialog")
  .attr("aria-labelledby","modal")
  .append("div")
    .style("width","50%")
    .attr("class","modal-dialog")
    .attr("role","document")
  .append("div")
    .attr("class","modal-content")

var warningModalHeaderDiv = warningModalContent.append("div")
      .attr("class","modal-header")

var warningModalHeader = warningModalHeaderDiv.append("div").append("h3")
    .attr("class","modal-title logoLightBlue-500")
    .attr("id","myModalLabel")

var warningModalBody = warningModalContent.append("div")
  .attr("class","modal-body clearfix")
  .style("padding-top","0px")

var warningAlert = warningModalBody.append("div")
  .attr("class","alert alert-danger")
  .attr("role","alert")

var warningInstructions = warningModalBody.append("div")
  .attr("class","alert")

var warningTableDiv = warningModalBody.append("div")
  .attr("class","table-responsive")

var warningModalFooter = warningModalContent.append("div")
  .attr("class","modal-footer")

var warningButton =  warningModalFooter.append("button")
      .attr("class","btn btn-default")
      .attr("data-dismiss",'modal')
      .text("Add New Client")

var initialModalContent = d3.select("body").append("div")
  .attr("class","modal fade")
  .attr("id","initial")
  .attr("tabindex","-1")
  .attr("role","dialog")
  .attr("aria-labelledby","modal")
  .append("div")
    .style("width","50%")
    .attr("class","modal-dialog")
    .attr("role","document")
  .append("div")
    .attr("class","modal-content")

var initialModalHeaderDiv = initialModalContent.append("div")
      .attr("class","modal-header")

var initialModalHeader = initialModalHeaderDiv.append("div").append("h3")
    .attr("class","modal-title logoLightBlue-500")
    .attr("id","myModalLabel")

var initialModalBody = initialModalContent.append("div")
  .attr("class","modal-body clearfix")
  .style("padding-top","0px")

var initialModalFooter = initialModalContent.append("div")
  .attr("class","modal-footer")

var initialButton =  initialModalFooter.append("button")
      .attr("class","btn btn-default")
      .attr("data-dismiss",'modal')
      .text("Ok")

  ws.onmessage = function (event) {
    switch(JSON.parse(event.data).type){
      case "navBar":
        data = JSON.parse(event.data).data
        console.log(data)
        navBar(d3.select("body"),data,function(done){
          console.log("done")
          ws.send(JSON.stringify({type:"pageState"}))
        })
      break;
      case "pageState":
        data = JSON.parse(event.data).data
        console.log(data)

        var faqText = [
          {
            name:"intro",
            title:null,
            text:"Add a new user to the capacity tracker using the form to the left."
          },{
            name:"email",
            title:null,
            text:"After you have completed the form, the new user will automatically receive an email to set up a password."
          }]

        var container = d3.select("body")
          .append("div")
          .attr("class","container-fluid")
          .append("div")
            .attr("class","row")

        var userDiv = container.append("div")
          .attr("class","col-md-8")
          .attr("id","userDiv")
          .style("font-family","'Gotham SSm A','Gotham SSm B','Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")

        var faq = container.append("div")
          .attr("class","col-md-4")
          .style("font-family","'Gotham SSm A','Gotham SSm B','Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")

        faq.append("div")
            .attr("class","row")
            .append("div")
              .attr("class","col-md-12")
              .append("h3")
                .text("Instructions")

        var faqRows = faq.append("div")
          .attr("class","row col-md-12")
          .selectAll("div")
            .data(faqText)
            .enter().append("div")
              .attr("class","row col-md-12")

        faqRows.append("div")
          .attr("class","row col-md-12")
          .append("h4")
            .text(function(d){
              return d.title
            })

        faqRows.append("div")
          .attr("class","row col-md-12")
          .append("div")
            .attr("class",function(d){
              if(d.class){
                return "row col-md-12 "+d.class
              }else{
                return "row col-md-12"
              }
            })
            .text(function(d){
              return d.text
            })
            .style("text-align","left")

          ws.send(JSON.stringify({type:"pageData"}))

      break;
      case "pageData":
        data = JSON.parse(event.data).data

        console.log(data)

      var userInputs = [{
            name:"firstName",
            label:"First Name",
            tag:"input",
            type:"text",
            help:null,
            required:true
          },
          {
            name:"lastName",
            label:"Last Name",
            tag:"input",
            type:"text",
            help:null,
            required:true
          },
          {
            name:"email",
            label:"Email",
            tag:"input",
            type:"email",
            help:"270 Strategies email address",
            required:true
          },
          {
            name:"username",
            label:"Username",
            tag:"input",
            type:"text",
            help:"Standard is first letter of first name followed by last name (Example: akahle)",
            required:true
          },
          {
            name:"dept",
            label:"Department",
            tag:"select",
            data:data.userDepts,
            help:null
          },{
            name:"team",
            label:"Team",
            tag:"select",
            data:data.userTeams.filter(function(d){
              return d.dept_id === data.userDepts[0].value
            }),
            help: null
          },{
            name:"role",
            label:"Role",
            tag:"select",
            data:data.userRoles,
            help: "Role level at 270. Equivalent to pay band."
          },{
            name:"access",
            label:"Access Level",
            tag:"select",
            data:data.userAccess,
            help: "Access level for the Capacity Tracker."
          },{
            name:"manager",
            label:"Manager",
            tag:"select",
            data:data.managers,
            help: null
          }]

      var warningClientDisplay = [{
          name:"label",
          label:"Client Name",
          width:"35%"
        },{
          name:"project_type",
          label:"Project Type",
          width:"15%"
        },{
          name:"project_subtype",
          label:"Project Subtype",
          width:"15%"
        },{
          name:"created_by",
          label:"Created By",
          width:"15%"
        },{
          name:"created_at",
          label:"Created At",
          width:"10%"
        }]

    var newUser = d3.select("#userDiv").append("div")
      .attr("class","row")

      newUser.append("div")
        .attr("class","col-md-12")
        .append("h3")
          .text("Create a New User")

    var newUserForm = newUser.append("form")
      .attr("id","newUser")
      .attr("class","form")
      .attr("name","newUser")
      .attr("action","/users/create")
      .attr("method","POST")
      .style("font-family","'Gotham SSm A','Gotham SSm B','Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
      .on("submit",function(d){
        if(clientMatches.length>0){
          d3.event.preventDefault()
          warningModalHeader.text("Potential Duplicate Client")
          warningAlert.text("The user you entered already exists. Check on the users tab to be sure you aren't creating a duplicate.")
          warningInstructions.text("Click OK to create the new client or click on the client name to add a new engagement on the existing one.")

          warningTableDiv.selectAll("*").remove()
          var warningClientTable = warningTableDiv.append("table")
              .attr("class","table")
              .style("font-size","12px")

          warningClientTable.append("thead")
            .append("tr")
            .selectAll("th")
              .data(warningClientDisplay)
              .enter().append("th")
              .attr("width",function(d){
                return d.width
              })
              .text(function(d){
                return d.label
              })

          warningClientTable.append("tbody")
            .selectAll("tr")
              .data(clientMatches)
              .enter().append("tr")
              .selectAll("td")
                .data(function(row){
                  return warningClientDisplay.map(function(col){
                    return {row:row,col:col,val:row[col.name]}
                  })
                })
                .enter().append("td")
                .attr("width",function(d){
                  return d.col.width
                })
                .append("div")
                  .style("float","left")
                  .style("cursor",function(d){
                    if(d.col.name==="label"){return "pointer"}
                  })
                  .style("color",function(d){
                    if(d.col.name==="label"){return "#00ACD4"}
                  })
                  .style("text-decoration",function(d){
                    if(d.col.name==="label"){return "underline"}
                  })
                  .text(function(d){
                    return d.val
                  })
                  .on("click",function(d){
                    $('#warning').modal('hide')
                    $('#tab-newEngagement').tab('show')
                    engagementFormGroups.selectAll("select").filter(function(d){
                      return d.name==="client"
                    }).selectAll("option")
                      .attr("selected",function(a){
                        if(d.row.value === a.value){return "selected"}
                      })

                    engagementFormGroups.selectAll("select").filter(function(d){
                      return d.name==="projectType"
                    }).selectAll("option")
                    .attr("selected",function(a){
                      if(d.row.project_type_id === a.value){return "selected"}
                    })
                    $('.selectpicker').selectpicker("refresh");

                  })

          warningButton.on("click",function(){
            d3.select("#newClient").node().submit()
          })

          $('#warning').modal({
            keyboard:false,
            backdrop:"static"
          })
        }
      }).append("div")
        .attr("class","col-md-12")
        .append("div")
          .attr("class","col-md-12")

            var userFormGroups = newUserForm.selectAll("div")
                .data(userInputs)
                .enter().append("div")
                .attr("class","form-group row")

            var userInputGroups = userFormGroups.append("div")
              .attr("class","col-md-4")

            userInputGroups.append("label")
              .attr("for",function(d){
                return d.name
              })
              .text(function(d){
                return d.label
              })

            userInputGroups.append(function(d){
              return document.createElement(d.tag)
            })
              .attr("class","form-control")
              .attr("id",function(d){
                return d.name
              })
              .attr("type",function(d){
                if(d.type){return d.type}
              })
              .attr("name",function(d){
                return d.name
              })
              .attr("required",function(d){
                if(d.required){return "required"}
              })

            var userHelp = userFormGroups.append("div")
              .attr("class","col-md-8")
            .append("p")
              .attr("class","help-block")
              .text(function(d){
                return d.help
              })
              .style("margin-top",userInputGroups.select("label").node().getBoundingClientRect().height+10+"px")

            userFormGroups.selectAll("select")
              .selectAll("option")
                .data(function(d){
                  return d.data
                })
                .enter().append("option")
                .attr("Value",function(d){
                  return d.value
                })
                .text(function(d){
                  return d.label
                })

            userFormGroups.selectAll("select").filter(function(d){
              return d.name === "dept"
            }).on("change",function(d){
              var deptId = this.value
              userFormGroups.selectAll("select").filter(function(a){
                return a.name==="team"
              }).selectAll("option").remove();
              userFormGroups.selectAll("select").filter(function(a){
                return a.name==="team"
              }).selectAll("option")
                .data(data.userTeams.filter(function(a){
                  return parseInt(a.dept_id) === parseInt(deptId)
                }))
                .enter().append("option")
                .attr("value",function(d){
                  return d.value
                })
                .text(function(d){
                  return d.label
                })
            })

            newUserForm.append("div")
              .attr("class","col-md-5")
                .append("button")
                  .attr("class","btn btn-default")
                  .attr("id","submitButton")
                  .attr("value","submit")
                  .text("Submit")

      break;
    }
  }
