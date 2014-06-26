var _handlebars = require('handlebars');

module.exports = function _helpers() {
  
  _handlebars.registerHelper('CapitalizeFirstLetter', function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  });
  
  _handlebars.registerHelper('isEmptyArray', function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
  });

}