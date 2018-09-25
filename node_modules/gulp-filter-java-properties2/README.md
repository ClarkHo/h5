# gulp-filter-java-properties2

> [gulp](https://github.com/wearefractal/gulp) wrapper for the [filter-java-properties](https://github.com/samolsen/node-filter-java-properties) Node package. Performs key-value string replacement, similar to the Maven Resources plugin.

Note: this repository clone from [gulp-filter-java-properties](https://github.com/samolsen/gulp-filter-java-properties) and add extra properties support.

## Usage

First, install `gulp-filter-java-properties2` as a development dependency:

```shell
npm install --save-dev gulp-filter-java-properties2
```

Then, add it to your `gulpfile.js`:

```javascript
var filterProperties = require("gulp-filter-java-properties2");
var extraProperties = { date: new Date() };

gulp.src("./src/*.ext")
	.pipe(filterProperties({
      propertiesPath: "configure.properties",
      extraProperties: extraProperties,//optional
      delimiters: ["${*}", "@"] // optional, defaults shown
	}))
	.pipe(gulp.dest("./dist"));
```

## API

### filter-java-properties2(options)

#### options.propertiesPath
Type: `String`  
*Required*

Path to a **.properties** file. Path should be absolute, or relative to `process.cwd()`.

#### options.extraProperties
Type: `Object`  
Sample: {date: new Date()}

#### options.delimiters
Type: `String`  
Default: `["${*}", "@"]`


Delimiters to use for string filtering. [More info](https://github.com/samolsen/node-filter-java-properties/blob/master/docs/javascript-api.md#filter-delimiters).


## Test
Run gulp test to execute simple test example

```shell
gulp test
```


