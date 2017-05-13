var include       = require('../../include').include,
    App           = include('/routes/app'),
    templates     = include('/routes/templates').templates;

exports.getReports = function(req,res){
  switch(req.params.report){
    case "topline":
      res.send(templates.template.expand({
        title:"Echo - Topline Report",
        js:"./js/reports/topline.js"
      }))
    break;
  }
}
