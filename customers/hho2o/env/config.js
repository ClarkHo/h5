
//#########
//#与company相关的业务相关配置
//##########
var _ = require("lodash");
var superConfig = require("../../../core/env/config.base");
var config={
  "isO2O":true,
  //deeplink 的 appSchema
  "appSchema" :"hh",
  //项目名称
  "companyName":"海航",
  "dev":{
    "staticPath":"/57/h5_mall",
  },
  "test":{
    "staticPath":"/57/h5_mall",
  },
  "stg":{
    "staticPath":"",
  },
  "online":{
    "staticPath":"",
    "redirectPath":""
  },
  //设置界面配置
  "setting":{
	  aboutUs:{
		  copyright:'Copyright@2008-2017',
		  companyName:'海航O2O测试商城'
	  },
      //关于我们
      showAboutUs:false
  }
};
config = _.merge(superConfig, config);
module.exports=  config;
