 var CSVToArray = function(strData){
        //count the number of commas
      var RE = new RegExp("[^,]", "gi");
      var numCommas = strData.replace(RE, "").length;

      //count the number of tabs
      RE = new RegExp("[^\t]", "gi");
      var numTabs = strData.replace(RE, "").length;

      var rowDelimiter = "\n";
      //set delimiter
      var columnDelimiter = ",";
      if (numTabs > numCommas) {
        columnDelimiter = "\t"
      };

      // kill extra empty lines
      RE = new RegExp("^" + rowDelimiter + "+", "gi");
      strData = strData.replace(RE, "");
      RE = new RegExp(rowDelimiter + "+$", "gi");
      strData = strData.replace(RE, "");

      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = columnDelimiter

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        (
          // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

          // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

          // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;


      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
          strMatchedDelimiter.length &&
          (strMatchedDelimiter != strDelimiter)
          ){

          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push( [] );

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          var strMatchedValue = arrMatches[ 2 ].replace(
            new RegExp( "\"\"", "g" ),
            "\""
            );

        } else {

          // We found a non-quoted value.
          var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
      }

      // Return the parsed data.
      return( arrData );
    };

var jsonRender = function (dataGrid, headerNames, newLine) {
    //inits...
    var commentLine = "//";
    var commentLineEnd = "";
    var outputText = "[";
    var numRows = dataGrid.length;
    var numColumns = headerNames.length;

    //begin render loop
    for (var i=0; i < numRows; i++) {
      var row = dataGrid[i];
      outputText += "{";
      for (var j=0; j < numColumns; j++) {
          var rowOutput = '"' + ( row[j] || "" ) + '"';

      outputText += ('"'+headerNames[j] +'"' + ":" + rowOutput );

        if (j < (numColumns-1)) {outputText+=","};
      };
      outputText += "}";
      if (i < (numRows-1)) {outputText += ","+newLine};
    };
    outputText += "]";

    return outputText;
  }
