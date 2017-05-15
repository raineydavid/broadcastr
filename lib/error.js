
exports.route = function(res,err,route,user_id){
  var error = {
    err:err,
    route:route,
    user_id: user_id,
    date: new Date
  }

  console.log(error)

  res.redirect('/error')
}
