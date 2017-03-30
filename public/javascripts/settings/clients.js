var thisPage = '/settings/users'

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
    initial_e_id = getUrlParameter(path,"e_id")

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

  var userModalContent = d3.select("body").append("div")
    .attr("class","modal fade")
    .attr("id","user")
    .attr("tabindex","-1")
    .attr("role","dialog")
    .attr("aria-labelledby","modal")
    .append("div")
      .attr("class","modal-dialog modal-sm")
      .attr("role","document")
      .style("width","60%")
    .append("div")
      .attr("class","modal-content")

  var userModalHeader = userModalContent.append("div")
        .attr("class","modal-header")
        .append("h3")
          .attr("class","modal-title")
          .attr("id","myModalLabel")

  var userModalBody = userModalContent.append("div")
    .attr("class","modal-body clearfix")
    .style("padding-top","0px")

  userModalContent.append("div")
    .attr("class","modal-footer")
    .append("button")
      .attr("class","btn btn-default")
      .attr("data-dismiss",'modal')
      .text("Close")

  ws.onmessage = function (event) {
    switch(JSON.parse(event.data).type){
      case "navBar":
        data = JSON.parse(event.data).data
        console.log(data)
        navBar(d3.select("body"),data,function(done){
          console.log("done")
          ws.send(JSON.stringify({type:"settings",id:"users"}))
        })
      break;
      case "pageData":
         data = JSON.parse(event.data).data

        console.log(data)

        var userTabs = [{
            name:"Active Users",
            link:"activeUsers",
            type:"table",
            filter:false,
            class:"accentGreen-500"
          },{
            name:"Inactive Users",
            link:"inactiveUsers",
            type:"table",
            filter:true,
            class:"accentRed-500"
          },{
            name:"New User",
            link:"newUser",
            type:"form",
            action:"/settings/users/add",
            class:"logoLightBlue-500",
            fields:[
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
                name:"access",
                label:"Access Level",
                element:"select",
                options:"access",
                class:"col-xs-4 form-group",
                elementClass:"form-control",
                onChange:function(d){
                  if(d==="admin-270"){
                    d3.select("#client").style("visibility","hidden")
                  }else{
                    d3.select("#client").style("visibility","show")
                  }
                }
              },
              {
                name:"client",
                label:"Client",
                element:"select",
                options:"clients"
                class:"col-xs-4 form-group",
                elementClass:"form-control"
              },
              {
                name:"submit",
                label:"Submit",
                element:"button",
                type:"submit",
                class:"col-xs-2",
                elementClass:"btn btn-default logoLightBlue-500"
              }
            ]
          }]

        var userDisplay = [
          {
            name:"active",
            label:null,
            width: "2%"
          },
          {
            name:"fname",
            label:"First Name",
            width: "10%"
          },
          {
            name:"lname",
            label:"Last Name",
            width: "18%"
          },
          {
            name:"email",
            label:"Email",
            width: "15%"
          },
          {
            name:"access",
            label:"Access Level",
            width: "15%"
          },
          {
            name:"client",
            label:"Client",
            width: "15%"
          },
          {
            name:"created_at",
            label:"Created At",
            width: "10%"
          },{
            name:"created_by",
            label:"Created By",
            width: "15%"
          }]

  var contentDiv = d3.select("body").append("div")
    .attr("class","container-fluid")
      .append("div")
        .attr("class","row")
        .append("div")
          .attr("class",'col-md-12')

  var nav = contentDiv.append("div")
    .attr("role","navigation")
    .attr("class","navigation")

    nav.append("ul")
      .attr("class","nav nav-pills")
      .attr("role","tablist")
      .selectAll("li")
      .data(userTabs)
      .enter().append("li")
        .attr("class",function(d,i){
          if(i===0){return "active"}
        })
        .append("a")
          .attr("href",function(d){return "#"+d.link})
          .attr("data-toggle","pill")
          .text(function(d){return d.name})

    var userDivs = contentDiv.append("div")
        .attr("class","tab-content").selectAll("div")
        .data(function(d,i){
          if(i===0){active = "active"}else{null}
          return userTabs.map(function(a){
            return {data:a,active:active}
          })
        })
        .enter().append("div")
          .attr("id",function(d){
            return d.data.link})
          .attr("class",function(d,i){
            if(i===0){return "tab-pane active"}else{return "tab-pane"}
          })

      userDivs.append("div")
        .attr("class","row")
        .append("h3")
          .text(function(d){
            return d.name
          })
          .attr("class",function(d){
            return d.class
          })

    userTables = userDivs.filter(function(d){return d.type==="table"}).append("div")
      .attr("class","table-responsive")
      .append("table")
        .attr("class","table table-striped table-hover table-users sortable")

    userTables.append("thead").append("tr")
      .selectAll("th")
      .data(userDisplay)
      .enter().append("th")
      .text(function(d){
        return d.label
      })
      .style("font-weight","bold")
      .style("text-align","left")

    userTables.append("tbody")
      .selectAll("tr")
      .data(function(d){
        return data.users.filter(function(a){
          return a.inactive === d.data.filter
        })
      })
      .enter().append("tr")
      .selectAll("td")
      .data(function(d){
        return userDisplay.map(function(a){
          return {row:{id:d.e_id},col:{name:a.name,width:a.width},val:{value:d[a.name]}}
        })
      })
      .enter().append("td")
      .style("text-align","left")
      .style("width",function(d){
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
        .attr("data-toggle",function(d){
          if(d.col.name==="full_name"){return "modal"}
        })
        .attr("data-target",function(d){
          if(d.col.name==="full_name"){return "#user"}
        })
        .attr("data-name",function(d){
          if(d.col.name==="full_name"){return d.val.value}
        })
        .attr("data-e_id",function(d){
          if(d.col.name==="full_name"){return d.row.id}
        })
        .style("cursor",function(d){
          if(d.col.name==="full_name"){return "pointer"}
        })
        .style("color",function(d){
          if(d.col.name==="full_name"){return "#00ACD4"}
        })
        .style("text-decoration",function(d){
          if(d.col.name==="full_name"){return "underline"}
        })
        .text(function(d){
          return d.val.value
        })
        .on("mouseover",function(d){
          if(d.col.name==="full_name"){
            d3.select(this).style("font-weight","bold")
            d3.select(this).style("color","#17479E")
          }
        })
        .on("mouseout",function(d){
          if(d.col.name==="full_name"){
            d3.select(this).style("font-weight","normal")
            d3.select(this).style("color","#00ACD4")
          }
        })

        var fields = userTables.filter(function(d){return d.type==="form"}).append("form")
          .attr("class","form-inline")
          .attr("method","post")
          .attr("action",function(d){return d.action})

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

$('#user').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget),
      name = button.data('name'),
      e_id = button.data('e_id');

  userModalHeader.text(function(d){
      return name
    })

  var userData = data["users"].filter(function(d){
    return d.e_id === e_id
  })[0]

  userModalBody.selectAll("*").remove()

  var userContent = userModalBody.append("div")

  var userInfoDiv = userContent.append("div")
    .attr("class","row")
    .append("div")
      .attr("class","col-md-12")

  userInfoDiv.append("div")
    .attr("class","row")
    .append("div")
      .attr("class","col-md-12")
    .append("h3")
      .text("User Info")
      .style("font-size","18px")
      .style("margin-top","5px")

  var userInfoForm = userInfoDiv.append("form")
    .attr("class","form-inline col-md-12")
    .attr("id","userInfoForm")
    .attr("method","post")
    .attr("action","/users/update?e_id="+encodeURIComponent(e_id))

    var topRow = userInfoForm.append("div")
      .attr("class","row")

    var secondRow = userInfoForm.append("div")
      .attr("class","row")

    var middleRow = userInfoForm.append("div")
      .attr("class","row")

    var bottomRow = userInfoForm.append("div")
      .attr("class","row")

    var buttonRow = userInfoForm.append("div")
      .attr("class","row")

    userInfoForm.append("input")
      .style("display","none")
      .attr("name","e_id")
      .attr("value",function(){
        return e_id
      })

    var firstName = topRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    firstName.append("label")
      .attr("for","firstName")
      .text("First Name")
      .style("margin-left","10px")

    firstName.append("input")
      .attr("class","form-control")
      .attr("type","text")
      .attr("id","firstName")
      .attr("name","firstName")
      .attr("value",function(){
        return userData.first_name
      })

    var lastName = topRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    lastName.append("label")
      .attr("for","lastName")
      .text("Last Name")
      .style("margin-left","10px")

    lastName.append("input")
      .attr("class","form-control")
      .attr("type","text")
      .attr("id","lastName")
      .attr("name","lastName")
      .attr("value",function(){
        return userData.last_name
      })

    var email = secondRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    email.append("label")
      .attr("for","email")
      .text("Email")
      .style("margin-left","10px")

    email.append("input")
      .attr("class","form-control")
      .attr("type","text")
      .attr("id","email")
      .attr("name","email")
      .attr("value",function(){
        return userData.email
      })

    var username = secondRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    username.append("label")
      .attr("for","username")
      .text("Username")
      .style("margin-left","10px")

    username.append("input")
      .attr("class","form-control")
      .attr("type","text")
      .attr("id","username")
      .attr("name","username")
      .attr("value",function(){
        return userData.username
      })

    var dept = middleRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    dept.append("label")
      .attr("for","dept")
      .text("Department")
      .style("margin-left","10px")

    var deptDD = dept.append("select")
      .attr("class","form-control")
      .attr("id","dept")
      .attr("name","dept")
      .on("change",function(d){
        teamDD.selectAll("option").remove()
        teamDD.selectAll("option")
          .data(data.userTeams.filter(function(d){
            return parseInt(d.dept_id) === parseInt(deptDD.node().value)
          }))
          .enter().append("option")
          .attr("value",function(d){
            return d.team_id
          })
          .text(function(d){
            return d.team_name
          })
          .attr("selected",function(d){
            if(d.team_id===userData.team_id){return "selected"}
          })
      })

      deptDD.selectAll("option")
        .data(data.userDepts)
        .enter().append("option")
        .attr("value",function(d){
          return d.dept_id
        })
        .text(function(d){
          return d.dept_name
        })
        .attr("selected",function(d){
          if(d.dept_id===userData.dept_id){return "selected"}
        })

    var team = middleRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    team.append("label")
      .attr("for","team")
      .text("Team")
      .style("margin-left","10px")

    var teamDD = team.append("select")
      .attr("class","form-control")
      .attr("id","team")
      .attr("name","team")

      teamDD.selectAll("option")
        .data(data.userTeams.filter(function(d){
          return d.dept_id === userData.dept_id
        }))
        .enter().append("option")
        .attr("value",function(d){
          return d.team_id
        })
        .text(function(d){
          return d.team_name
        })
        .attr("selected",function(d){
          if(d.team_id===userData.team_id){return "selected"}
        })

    var role = bottomRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    role.append("label")
      .attr("for","role")
      .text("Role")
      .style("margin-left","10px")

    var roleDD = role.append("select")
      .attr("class","form-control")
      .attr("id","role")
      .attr("name","role")

      roleDD.selectAll("option")
        .data(data.roles)
        .enter().append("option")
        .attr("value",function(d){
          return d.dept_role_id
        })
        .text(function(d){
          return d.dept_role_name
        })
        .attr("selected",function(d){
          if(d.dept_role_id===userData.dept_role_id){return "selected"}
        })

    var manager = bottomRow.append("div")
      .attr("class","form-group col-md-3")
      .style("float","left")

    manager.append("label")
      .attr("for","manager")
      .text("Manager")
      .style("margin-left","10px")

    var managerDD = manager.append("select")
      .attr("class","form-control")
      .attr("id","manager")
      .attr("name","manager")

      managerDD.selectAll("option")
        .data(function(){
          return data.managers.filter(function(d){
            return d.e_id!=e_id
          })
        })
        .enter().append("option")
        .attr("value",function(d){
          return d.e_id
        })
        .text(function(d){
          return d.full_name
        })
        .attr("selected",function(d){
          if(d.e_id===userData.manager_id){return "selected"}
        })

    var userInfoButton = buttonRow.append("div")
      .attr("class","row col-md-3")
      .attr("id","userInfoButton")

    userInfoButton.append("button")
      .attr("class","btn btn-default")
      .style("float","left")
      .style("margin-left","25px")
      .text("Submit Changes")


})

$("#user").on("shown.bs.modal",function(){
  d3.select("#userInfoButton").style("margin-top",d3.select("#userInfoForm").select(".form-group").select("label").node().getBoundingClientRect().height+5+"px")
})


$.bootstrapSortable(true);

var userInactiveForms = userTables.filter(function(d){
  return d.data.link === "activeUsers"
}).select("tbody").selectAll("td").filter(function(d){
  return d.col.name==="active"
}).append("form")
  .attr("action","/users/inactive")
  .attr("method","POST")
  .style("margin-bottom","0px")

  userInactiveForms.append("input")
    .attr("name","e_id")
    .style("display","none")
    .attr("value",function(d){
      return d.row.id
    })

userInactiveForms.append("button")
  .attr("class","glyphicon glyphicon-remove-sign accentRed-500 glyph-button")
  .on('mousemove', function(d) {
    tooltipDisplay("Make User Inactive")
  })
  .on('mouseout', function(d) {
    tooltipHide()
  })

var userActiveForms = userTables.filter(function(d){
  return d.data.link === "inactiveUsers"
}).select("tbody").selectAll("td").filter(function(d){
  return d.col.name==="active"
}).append("form")
  .attr("action",function(d){
    return "/users/active?e_id="+encodeURIComponent(d.row.id)
  })
  .attr("method","POST")
  .style("margin-bottom","0px")

  userActiveForms.append("input")
    .attr("name","e_id")
    .style("display","none")
    .attr("value",function(d){
      return d.row.id
    })

userActiveForms.append("button")
  .attr("class","glyphicon glyphicon-ok-sign accentGreen-500 glyph-button")
  .on('mousemove', function(d) {
    tooltipDisplay("Make User Active")
  })
  .on('mouseout', function(d) {
    tooltipHide()
  })


if(initial_e_id!=undefined){
  var relatedTarget = userTables.selectAll("tr").filter(function(d){
      if(d){
        return parseInt(d.e_id) === parseInt(initial_e_id)
      }
    }).selectAll("td").filter(function(d){
      return d.col.name === "full_name"
    }).select("div")

  $('#user').modal('show',$(relatedTarget.node()))

}

      break;
    }
  }
