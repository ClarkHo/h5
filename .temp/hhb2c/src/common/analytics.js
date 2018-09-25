/**
 * 这个js中全部放跟业务不相关的代码
 * 比如百度客服，跟踪云，百度统计等
 * 其中defer是指异步加载，不阻塞页面加载，但是要等到其他（之前的）js脚本执行完完才执行
 * async也是异步加载，不阻塞页面加载，但是是乱序的，自己加载完就执行
 * 无依赖的代码推荐使用async
 * env中config添加开关配置
 */


var  config = require("../../env/config.js");
var  heimdall = require("./heimdall.js");
var  baiduHm = require("./baiduHm.js");


try{
    if(config){
        for(var an in config.analysis){
            if(config.analysis.hasOwnProperty(an)){
                if(config.analysis[an]){
                    eval('('+an+'())');
                }
            }
        }
    }
}catch(err){
    console.log(err);
}
 