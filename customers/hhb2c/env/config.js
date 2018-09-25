
//#########
//#与company相关的业务相关配置
//##########

var config={
  "platformId": 3,  //H5
  "pageCode":"H5_HOME",
  "businessType":1,
  //用户类型
  "userPlatformId": 4, //运营后台传1 机构用户传2 普通用户传4
  "afterSaleType":'1,2,4',   //只有退货
  "isO2O":false,
  //图片懒加载的加载过程图
  "loadingImg":"http://cdn.oudianyun.com/static/cms/op/default_product.png",
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
  //deeplink 的 appSchema
  "appSchema" :"hh",
  //项目名称
  "companyName":"海航",
  //统计，埋点相关
  "analysis":{
    "baiduHm":true, //百度统计
    "heimdall":true
  },
  "dev":{
    "staticPath":"/54/h5_mall",
  },
  "test":{
    "staticPath":"/54/h5_mall",
  },
  "stg":{
    "staticPath":"",
  },
  "online":{
    "staticPath":"",
    "redirectPath":""
  },
  //功能开关
  /**
   * @param useMerchant 店铺
   * @param useConsult 咨询
   * @param useAsk 问答
   * @param useCommission 佣金
   * @param usePoint 积分
   * @param useServiceCenter 服务中心
   * @param useScore 积分商城
   * @param useFeatures 特色功能
   * @param useMembersOnly 会员专享
   * 
   * 页面中的功能块儿放在页面下 个人中心>特色功能 {home:useFeatures}
   * 全站的功能点放在外部{usePoint}
   */
  "useMerchant":true,
  "useConsult":false,
  "useAsk":false,
  "useCommission":false,
  "usePoint":false,
  "useScore":false,
  "footer":{
    "useServiceCenter":false
  },
  "home":{
    "useFeatures":false,
    "useMembersOnly":false
  }

};
module.exports=  config;
