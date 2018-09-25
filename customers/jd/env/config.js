
//#########
//#与company相关的业务相关配置
//##########

var config={
  //图片懒加载的加载过程图
  "loadingImg":"http://cdn.oudianyun.com/lyf-local/branch/back-cms/1505980570453_2441_64.png",
  //mob分享的appKey
  "appKey":"202cce063dd31",
  //高德地图的key
  "mapKey":"",
  //umaman转发路径
  "redirectPath":"",
  //TalkingDataAppID
  "TKAppId":"",
  //口令红包地址
  "redPacket":"",
  //mob appSchema
  "appSchema" :"op",
  //css，js，图片等静态文件根路径
  //mob appKey
  "appKey":"202cce063dd31",
  //高德地图的key
  "mapKey":"4cbe65ccdb8919a83e3fa235b93b0fa9",
  "dev":{
    "staticPath":"",
  },
  "test":{
    "staticPath":"",
  },
  "stg":{
    "staticPath":"http://stg.static.eopple.com",
  },
  "online":{
    "staticPath":"http://static.oppleshop.com",
  },
  //后台域名
  "adminHost": "",
  
  "contextPath":"",
  "askSwitch":true,
  "apiHost":"",
  "ouserHost":"",
  "opayHost":"",

  "analysis":{
    "baiduHm":true, //百度统计
    "heimdall":true //跟踪云
  },
};
module.exports=  config;
