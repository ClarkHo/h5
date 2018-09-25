// Import gulp & plugins
var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var del = require("del");
var uglify = require("gulp-uglify");
var cleancss = require("gulp-clean-css");
var htmlmin = require("gulp-htmlmin");
var less = require("gulp-less");
var concat = require("gulp-concat");
var csslint = require("gulp-csslint");
var gulpif = require("gulp-if");
var browserify = require("browserify");
var stream = require("vinyl-source-stream");
var streamify = require("gulp-streamify");
var buffer = require("vinyl-buffer");
var globby = require("globby");
var filterProperties = require("gulp-filter-java-properties2");
var args = require("args");
var replace = require("gulp-replace");
var requireDir = require('require-dir');
var envConfig=require('./envConfig');
var packageJson=require('./package.json');

//命令行参数
args
  .option("minify", "minify html css js files (default is false, do not minify code.)", false)
  //.option("env", "env properties file path (default is env/dev.properties)", "env/dev.properties")
  .option("env", "env properties file path (default is dev)", "dev")
  .option("output", "the output directory of building (default is dist)", "dist")
  .option("customer","the customers which would be built","saas");
 
var options = args.parse(process.argv);
var productName= packageJson.name;
/**
 * 定制的companyId
 * @type {{oupu: number}}
 */
var outputPath={};
for(let projectName in envConfig){
    outputPath[projectName]=envConfig[projectName].companyId+'/'+productName;
}
console.log(outputPath);

var customerUrl = "./customers/"+options.c;
var customerUrlForWatch = "customers/"+options.c;
var config = require(customerUrl+"/env/config.js")

requireDir('./gulps');
console.log("==== command options ====");
console.log(options);

//if true, minify resources, used in production.
//if false, no minify reources, used in development.
var minify = options.minify;
//env file path
var env = options.env;
//output directory
var outputDir = options.output+"/"+(outputPath[options.c]||options.c);

//gulp-filter-java-properties config
var filterDelimiters = ["${*}"] ;
//dynamic properties

var extraProperties ={version: new Date().getTime()};

/**
 * 如果本地开发去掉staticPath
 */
var localVars = {};
var localArr = ['dev','test','stg','online','edu'];
var isLocal = false;
for(var i=0;i<localArr.length;i++){
    if(process.argv.indexOf('--'+localArr[i])>-1){
        isLocal = true;
        break;
    }
}
console.log(JSON.stringify(process.argv));
//本地开发
console.log(isLocal);
if(isLocal){
    localVars.staticPath = '';
    localVars.wx302Url = config[env].wx302Url;
}else{
    localVars.staticPath = config[env].staticPath;
    localVars.wx302Url = config[env].wx302Url;
}


try{
    extraProperties=Object.assign(extraProperties,config,localVars);
}catch (e){
    console.log('no customer extraProperties');
}


//paths
var paths = {
    //source  path
    src: "./.temp/"+options.c+"/src",
    temp:"./.temp/"+options.c,
    libs: [
        //hold dependencies that not managed by bower
        { src: "libs/**", dest: "" }
    ],

    //build target directory
    dist: outputDir
};

//vendor js libs will be merge into vendor.js
var vendorLibs = ["vue", "vue-resource", "vue-touch", "vue-lazyload", "vue-i18n"];

function checkExist(fileName){
    var f=true;
    try{
        fs.statSync(fileName);
    }catch(err){
        f=false;
    }
    return f;
}

// default task
gulp.task("default", ["watch"]);

//note: only watch the files maybe changed frequently
gulp.task("watch", ["clean", "build"], function() {

    var commonFiles = [
        "src/common/**/*.js",
        "src/common/**/*.less"
    ];

    var componentsFiles = [
        "src/components/**/*.vue"
    ];

    var pageFiles = [
        "src/pages/**/*.js",
        "src/pages/**/*.less",
        "src/pages/**/*.html"
    ];

    var imageFiles = [
        "src/images/**/*"
    ];

    var i18nFiles = [
        'src/i18n/**/*'
    ];

    //temp目录的监听
    var moduleCustomer = args.parse(process.argv).customer;
    var modulePaths={
        srcCore:'core/src/**/*',
        srcCust:path.join('customers',moduleCustomer,'src/**/*'),
        dest:path.join('.temp',moduleCustomer,'src')
    }
    //修改customer与core目录文件
    function deleteCustCore(custOrCore,file) {
        //删除文件的主路径(区分core与customers)
        var mainPath = custOrCore == 'core' ? custOrCore : path.join(custOrCore, moduleCustomer),
            //取得变化文件的相对路径(去除core与customers的部分)
            relPath = path.relative(mainPath, file.path),
            //取得相对路径的文件夹(不带文件名)
            relDir = path.dirname(relPath),
            //core或customers里面相应的文件路径
            fromPath = custOrCore == 'core' ? path.join('customers', moduleCustomer, relPath):path.join('core', relPath) ;
        //判断core或customers里没有没相应文件
        fs.exists(fromPath, function (isExist) {
            if (isExist) { //如果core或customers里存在此文件, 用customers或core里的文件替换
                console.log('overwrite with: ', fromPath);
                return gulp.src(fromPath) //core或customers目录下的对应文件
                    .pipe(gulp.dest(path.join('.temp', moduleCustomer, relDir))); //temp目录下的对应文件夹
            } else { //如果不存在,直接删除
                console.log(file.type + ' files:', file.path);
                del.sync(path.join('.temp', moduleCustomer, relPath)); //temp目录下的对应文件
            }
        });
    }
    gulp.watch([modulePaths.srcCore, modulePaths.srcCust], function (file) {
        if (file.type == 'deleted') {
            //删除操作
            deleteCustCore(file.path.indexOf('customers') >= 0?'customers':'core',file);
        } else {
            var mainPath, relPath, relDir;
            //主目录的名称判断(判断是core还是customers的文件)
            if (file.path.indexOf('customers') >= 0) {
                mainPath = path.join('customers', moduleCustomer);
            } else if (file.path.indexOf('core') >= 0) {
                mainPath = 'core';
            }
            relPath = path.relative(mainPath, file.path); //取得变化文件的相对路径(去除core与customers的部分)
            relDir = path.dirname(relPath); //取得相对路径的文件夹(不带文件名)
            console.log(file.type + ' files:', file.path);
            return gulp.src(path.join(mainPath, relPath))
                .pipe(gulp.dest(path.join('.temp', moduleCustomer, relDir)));
        }
    });
    gulp.watch(commonFiles, {cwd: paths.temp}, ["common"]);
    //gulp.watch(componentsFiles, {cwd: paths.temp}, ["pages"]);
    gulp.watch(imageFiles, {cwd: paths.temp}, ["images"]);
    gulp.watch(i18nFiles, {cwd: paths.temp}, ["i18n"]);
    // gulp.watch(pageFiles, ["pages"]);
    gulp.watch(pageFiles, {cwd: paths.temp}, function (event) {
        // debugger;
        console.log(event)
        //skip process delete file event
        if (event.type == "deleted") {
            return;
        }

        var filePath = event.path;
        var ext = path.extname(filePath);
        console.log("Compile file: "  + filePath);

        if (ext == ".js") {
            compileJs(filePath, getPageFileDistPath(filePath), path.basename(filePath), minify);
        } else if (ext == ".less") {
            compileLess(filePath, getPageFileDistPath(filePath), path.basename(filePath, ".less") + ".css", minify);
        } else if (ext == ".html") {
            compileHtml(filePath, getPageFileDistPath(filePath), minify);
        }
    });

});

function getPageFileDistPath(filePath) {
    var pagePath = path.join(__dirname, paths.src + "/pages");
    var relatedPath = path.dirname(filePath.substr(pagePath.length+1));
    return path.join(paths.dist, relatedPath);
}
//start build after merged
gulp.task("build",['merge-temp'],function(){
    gulp.start(["main"]);
});
//build all project
gulp.task("main", ["images", "i18n", "fonts", "libs", "vendorjs", "common", "pages"]);

gulp.task("clean",function() {
    del.sync(paths.dist);
});

//process custom libs and bower managed libs
gulp.task("libs", function() {
    var lib;

    for (var i = 0; i < paths.libs.length; i++) {
        lib = paths.libs[i];
        
        gulp.src(lib.src)
            .pipe(gulp.dest(paths.dist + "/libs/" + lib.dest));
    }

});
//copy i18n
gulp.task("i18n",function(){
    gulp.src(paths.src + "/i18n/**")
        .pipe(gulp.dest(paths.dist + "/i18n"))
})

//copy images
gulp.task("images", function() {
    gulp.src(paths.src + "/images/**")
        .pipe(gulp.dest(paths.dist + "/images"));
});

// copy fonts
gulp.task("fonts", function() {
    gulp.src(paths.src + "/common/styles/fonts/**")
        .pipe(gulp.dest(paths.dist + "/fonts"));
});

//compile common resources
gulp.task("common", function() {
    var commonDir = path.join(paths.src, "common");

    var lessFiles = [//调整文件顺序
        commonDir + "/**/icons.less",
        commonDir + "/**/icons-jd.less",
        commonDir + "/**/frozenui-custom.less",
        commonDir + "/**/common.less",

        "!" + commonDir + "/variables.less"
    ];

    var jsFiles = [
        commonDir + "/**/sessionStorage.js",
        commonDir + "/**/localStorage.js",
        commonDir + "/**/cookie.js",
        commonDir + "/**/eventSupport.js",
        commonDir + "/**/auth.js",
        commonDir + "/**/browser.js",
        commonDir + "/**/utils.js",
        commonDir + "/**/api-request.js",
        commonDir + "/**/mall-setting.js",
        commonDir + "/**/session-id.js",
        commonDir + "/**/*.js",
        commonDir + "/**/app.js",
        //exclue test files
        "!" + commonDir + "/**/*.test.js"
    ];

    compileLess(lessFiles, paths.dist, "common.css", minify);
    compileJs(jsFiles, paths.dist, "common.js", minify);
});

//compile vendorjs
gulp.task("vendorjs", function() {
    compileVendorJs(minify);
});

//build application
gulp.task("pages", function() {
    compilePages(paths.src + "/pages", paths.dist, minify);

});

//compile page dir - support sub directory
function compilePages(srcDir, destDir, minify) {
    //
    fs.readdirSync(srcDir).filter(function(file) {
        if (excludeFile(file)) {
            console.log("skip process file/directory: " + file);
            return;
        }

        var filePath = path.join(srcDir, file);
        var fileStats = fs.lstatSync(filePath);

        //treat directory as dir
        if (fileStats.isDirectory()) {
            //
            compilePages(filePath, path.join(destDir, file), minify);

        } else if (fileStats.isFile()) {
            //normal file
            var ext = path.extname(file);

            switch (ext) {
                case ".html":
                    compileHtml(filePath, destDir, minify);
                    break;
                case ".less":
                    compileLess(filePath, destDir, path.basename(file, ".less") + ".css", minify);
                    break;
                case ".js":
                    //skip test file
                    if (file.lastIndexOf(".test.js") < 0) {
                        compileJs(filePath, destDir, file, minify);
                    }
                    break;
                default:
                    //just copy resources
                    gulp.src(path.join(srcDir, file)).pipe(gulp.dest(destDir));
                    break;
            }
        }

    });

}

//Some special file or directory not need process
function excludeFile(file) {
    var c = file.charAt(0);
    return c === "." || c === "_";
}

//common functions
function compileHtml(source, destination, minify) {
    return gulp.src(source)
        .pipe(filterProperties({
            propertiesPath: "",
            extraProperties: extraProperties,
            delimiters: filterDelimiters 
        }))
        .pipe(gulpif(minify, htmlmin({ collapseWhitespace: true })))
        .pipe(gulp.dest(destination));
}

function compileLess(source, destination, concatName, minify, hideErrors) {
    var lessc = less();
    lessc.on("error", function (e) {
        console.log(e);
        lessc.end();
    });

    return gulp.src(source)
        .pipe(filterProperties({
            propertiesPath: "",
            extraProperties: extraProperties,
            delimiters: filterDelimiters 
        }))
        .pipe(lessc)
        // .pipe(csslint("csslintrc.json"))
        // .pipe(gulpif(!hideErrors, csslint.reporter()))
        .pipe(gulpif(minify, cleancss()))
        .pipe(concat(concatName))
        .pipe(gulp.dest(destination));
}

function compileVendorJs(minify) {
    // create a browserify bundle
    var b = browserify();
    //vue2默认引用的是runtime的版本，这里替换为完全版本(支持模板等特性)
    // var vueLib = "vue/dist/vue.common.js";

    // make vendor js available from outside
    vendorLibs.forEach(function (lib) {
        b.require(lib);
    });
    
    // start bundling
    b.bundle()
        .pipe(stream("vendor.js"))
        .pipe(buffer())
        //将上一步替换的路径在改回来（不改变项目的引用）
        // .pipe(replace(vueLib, "vue"))
        .pipe(gulpif(minify, uglify()))
        .pipe(gulp.dest(paths.dist + "/libs"))
}

function compileJs(source, destination, concatName, minify, hideErrors) {
    globby(source).then(function (entries) {
        var b = browserify({
            entries: entries,
            debug: false
        });

        //-x external module
        vendorLibs.forEach(function (lib) {
            b.external(require.resolve(lib));
        });
        
        b.bundle()
            .pipe(stream(concatName)) 
            .pipe(buffer())
            .pipe(filterProperties({
                propertiesPath: "",
                extraProperties: extraProperties,
                delimiters: filterDelimiters 
            }))
            .pipe(gulpif(minify, uglify()))
            .pipe(gulp.dest(destination));
    });
}

