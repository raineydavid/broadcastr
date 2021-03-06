  var topBar = d3.select("body").append("div")
    .attr("class","topBar")

      topBar.append("div")
      .attr("class","topBarText dark-blue-color")
      .text("Broadcastr")
      .style("float","left")

  var footer = d3.select("body").append("footer")
    .append("div")
    .attr("class","container")

  var body = d3.select("body").append("div")

  var container = body.append("div")
    .attr("class","container")
    .style("margin-top","10%")
    .style("background-color","white")

  var loginRow = container.append("div")
    .attr("class","row")

  loginRow.append("div")
    .attr("class","col-md-4")

  var loginFrame = loginRow.append("div")
    .attr("class","col-md-4")
    .style("background-color","white")

  loginRow.append("div")
    .attr("class","col-md-4")

  var loginForm = loginFrame.append("form")
    .attr("method","POST")
    .attr("enctype","")
    .attr("id","id_loginForm")
    .attr("name","loginForm")

  loginForm.append("div")
    .attr("class","frame-header light-blue-bg")
    .text("Log In")

  loginForm.append("div")
    .attr("class","form-group")
    .style("margin","auto")
    .style("margin-bottom","15px")
    .style("width","250px")
    .append("input")
      .style("margin","auto")
      .style("width","250px")
      .attr("class","form-control")
      .attr("name","email")
      .attr("placeholder","Email")
      .attr("id","inputEmail")
      .style("font-family","Raleway,'Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
      .style("cursor","text")

  loginForm.append("div")
    .attr("class","form-group")
    .style("margin","auto")
    .style("margin-bottom","15px")
    .style("width","250px")
    .append("input")
      .style("margin","auto")
      .style("width","250px")
      .attr("class","form-control")
      .attr("name","password")
      .attr("placeholder","Password")
      .attr("id","inputPassword")
      .attr("type","password")
      .style("font-family","Raleway,'Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
      .style("cursor","text")

  var warning = loginForm.append("div")
    .attr("class","alert alert-danger")
    .attr("role","alert")
    .html("Incorrect Username or Password")
    .style("display","none")

  var remember = loginForm.append("div")
      .style("margin","auto")
      .style("width","250px")
      .append("div")
        .attr("class","checkbox-inline")
        .style("margin-bottom","5px")
        .style("padding-left","0px")

  var rememberContainer = remember.append("label")

  var rememberCheckbox = rememberContainer.append("input")
        .attr("name","remember")
        .attr("id","remember")
        .attr("type","checkbox")
        .style("margin-left","0px")
        .style("cursor","pointer")

  var rememberLabel = rememberContainer.append("div").text("Remember Me")
        .style("font-family","Raleway,'Helvetica Neue',Helvetica,Arial,sans-serif, sans-serif")
        .style("padding-left",rememberCheckbox.node().getBoundingClientRect().width)
        .style("padding-right","13.5px")

        console.log(rememberLabel.node().getBoundingClientRect().width)

      remember.style("margin-left",(250-rememberLabel.node().getBoundingClientRect().width)/2)

  loginForm.append("div")
    .append("div")
      .attr("class","loginMessage")
      .html("<a href='/password_reset'>Forgot Password?</a>")

  var buttonDiv = loginForm.append("div")
      .style("margin","auto")

  var button = buttonDiv.append("button")
      .attr("class","btn btn-default light-blue-bg")
      .attr("id","submitButton")
      .attr("value","submit")
      .text("Submit")

    buttonDiv.style("width",button.node().getBoundingClientRect().width)

  if(location.hash==="#wrongPass"){
    warning.style("display","block")
  }
