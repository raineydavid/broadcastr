var fs            = require('fs'),
    bodyParser    = require('body-parser'),
    jsonParser    = bodyParser.json(),
    jsontemplate  = require('../json-template');

exports.templates = {
  template                           :jsontemplate.Template(fs.readFileSync('./templates/template.jsont').toString()),
  login_template                     :jsontemplate.Template(fs.readFileSync('./templates/login_template.jsont').toString()),
  success_template                   :jsontemplate.Template(fs.readFileSync('./templates/success_template.jsont').toString()),
  error_template                     :jsontemplate.Template(fs.readFileSync('./templates/error.jsont').toString()),
  intro_email                        :jsontemplate.Template(fs.readFileSync('./templates/intro_email.jsont').toString()),
  pw_reset_email                     :jsontemplate.Template(fs.readFileSync('./templates/pw_reset_email.jsont').toString())
};
