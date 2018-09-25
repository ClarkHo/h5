var gulp = require('gulp');
var args = require("args");
var del = require("del");
var path = require("path");
var fs = require("fs");

//命令行参数
args
    .option("minify", "minify html css js files (default is false, do not minify code.)", false)
    .option("env", "env properties file path (default is env/dev.properties)", "env/dev.properties")
    .option("output", "the output directory of building (default is dist)", "dist")
    .option("customer","the customers which would be built","saas")
    .option("directory","the customers which would be built",".temp");

var coreCustomer = args.parse(process.argv).customer; //customer name
var tmpDirectory = args.parse(process.argv).directory; //directory name
var coreBPath='';//root dir
var customerPaths= {
    core: [
        coreBPath + 'core/**/*',
        coreBPath + 'libs**/**/*'
    ],
    cust: [
        coreBPath + 'customers/' + coreCustomer + '/!(*-config.js)/**/*'
    ],
    dest: path.join(tmpDirectory, coreCustomer)
}
gulp.task('clean-temp',function () {
    del.sync(customerPaths.dest);
})
gulp.task('copy-core',['clean-temp'],function () {
    return gulp.src(customerPaths.core)
        .pipe(gulp.dest(customerPaths.dest));
})
gulp.task('merge-customer',['copy-core'],function () {
    return gulp.src(customerPaths.cust)
        .pipe(gulp.dest(customerPaths.dest));
})
// gulp.task('guide-watch',['guide-temp'],function () {
//     gulp.watch([customerPaths.srcCore, customerPaths.srcCust], function (file) {
//         console.log(file.type + ' files:', file.path);
//         var mainPath, relPath, relDir;
//         if (file.type == 'deleted') {
//             //只有customers的内容发生删除才会进行
//             if (file.path.indexOf('customers') >= 0) {
//                 //如果被删除文件只有customers才有, core里没有, 则直接删除, 否则使用core里的相关文件
//                 mainPath = 'customers/' + coreCustomer;
//                 relPath = path.relative(mainPath, file.path); //取得变化文件的相对路径(去除core与customers的部分)
//                 relDir = path.dirname(relPath); //取得相对路径的文件夹(不带文件名)
//                 //判断core里没有没相应文件
//                 fs.exists(path.join('core', relPath), function (isExist) {
//                     if (isExist) { //如果存在, 用core文件替换
//                         return gulp.src(path.join('core', relPath)) //core目录下的对应文件
//                             .pipe(gulp.dest(path.join('temp', coreCustomer, relDir))); //temp目录下的对应文件夹
//                     } else //如果不存在,直接删除
//                         del.sync(path.join('temp', coreCustomer, relPath)); //temp目录下的对应文件
//                 });
//             }
//         } else {
//             //主目录的名称判断(判断是core还是customers的文件)
//             if (file.path.indexOf('customers') >= 0) {
//                 mainPath = 'customers/' + coreCustomer;
//             } else if (file.path.indexOf('core') >= 0) {
//                 mainPath = 'core';
//             }
//             relPath = path.relative(mainPath, file.path); //取得变化文件的相对路径(去除core与customers的部分)
//             relDir = path.dirname(relPath); //取得相对路径的文件夹(不带文件名)
//             return gulp.src(path.join(mainPath, relPath))
//                 .pipe(gulp.dest(path.join('temp', coreCustomer, relDir)));
//         }
//     })
// })
gulp.task('merge-temp',['merge-customer']);
