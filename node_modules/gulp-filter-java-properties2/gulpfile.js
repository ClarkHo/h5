var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var filter = require("./index.js");


gulp.task("test", function() {
    var extraProperties = { date: new Date() };
    var myfilter = filter({
        propertiesPath: "./test/config.properties",
        extraProperties: extraProperties,
        delimiters: ["${*}"]
    });
    
    var res = gulp.src("test/*.txt")
        .pipe(myfilter);

    res.on("data", function(trunk){
    	console.log(trunk.contents.toString());
    });
});
