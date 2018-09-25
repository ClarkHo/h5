var through = require("through2"),
	gutil = require("gulp-util"),
	fs = require("fs"),
	os = require("os");

var PropertyFilter = require('filter-java-properties').PropertyFilter;

module.exports = function (opts) {
	"use strict";

	// if necessary check for required opts(s), e.g. options hash, etc.
	if (!opts) {
		throw new gutil.PluginError("gulp-filter-java-properties", "No opts supplied");
	}

	// see "Writing a plugin"
	// https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
	function filterJavaProperties(file, enc, callback) {
		/*jshint validthis:true*/

		// Do nothing if no contents
		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		var _this = this;
		//properties content
		var propertiesContent = "";

		//read properties content from path
		if (opts.propertiesPath) {
			propertiesContent += fs.readFileSync(opts.propertiesPath).toString();
		}

		//extra properties data
		if (opts.extraProperties) {
			propertiesContent += os.EOL;
			
			for (var key in opts.extraProperties) {
				propertiesContent += key + "=" + opts.extraProperties[key] + os.EOL;
			}
		}

		var filter = PropertyFilter.withString({
			string: propertiesContent,
			delimiters: opts.delimiters
		});

		// Handle buffer
		if (file.isBuffer()) {
			var contents = String(file.contents),
				filtered = filter.filterString(contents);
			file.contents = new Buffer(filtered);
			
			_this.push(file);
			return callback();
		}

		// Handle stream
		if (file.isStream()) {
			var inStream = file.contents, 
				outStream = through();

			filter
				.filterStream(inStream)
				.pipe(outStream);

			inStream
				.on('end', function () {
					file.contents = outStream;
					_this.push(file);
					callback();
				})
				.on('error', function (e) {
					_this.emit(err);
					callback();
				});

			return;
		}	

		return callback();
		
	}

	return through.obj(filterJavaProperties);
};
