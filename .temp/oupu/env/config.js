//#########
//#与company相关的业务相关配置
//##########
var _ = require("lodash");
var superConfig = require("../../../core/env/config.base");

var config = {
    //图片懒加载的加载过程图
    "loadingImg": "http://cdn.oudianyun.com/lyf-local/branch/back-cms/1505980570453_2441_64.png",
    //拼团详情页加载过程图
    "pinTuanDefaultImg": "",
    //mob分享的appKey
    "appKey": "202cce063dd31",
    "platformId": 3, //H5
    "platform": 2, //H5
    "pageCode": "H5_HOME",
    "businessType": 1,
    "companyName":"欧普官方商城",
    //用户类型
    "userPlatformId": 4, //运营后台传1 机构用户传2 普通用户传4
    "afterSaleType": '1,2,4', //只有退货
    "isO2O": false,

    //TalkingDataAppID
    "TKAppId": "",
    //口令红包地址
    "redPacket": "",
    //mob appSchema
    "appSchema": "op",
    //css，js，图片等静态文件根路径
    //mob appKey
    "appKey": "202cce063dd31",
    //高德地图的key
    "mapKey": "4cbe65ccdb8919a83e3fa235b93b0fa9",
    "heimdall_path": "/horse-core/heimdall-web/heimdall-bi",
    "heimdall_js": "heimdall-basic-news",
    "heimdall_appKey": "dbd14281-6e3d-46c2-8672-45a3e2156f7d",
    "heimdall_appSecret": "1494F325C96B41FAAE490637B8DAA0ED",
    "heimdall_productLine": "859133073",
    "heimdall_systemtype": "2",
    "dev": {
        "staticPath": "/51/h5_mall",
    },
    "test": {
        "staticPath": "/51/h5_mall",
    },
    "stg": {
        "staticPath": "http://stg.static.eopple.com",
    },
    "online": {
        "staticPath": "http://static.oppleshop.com",
        "wx302Url": "http://m.opplestore.com"
    },
    //后台域名
    "adminHost": "",
    "contextPath": "",
    "askSwitch": true,
    "apiHost": "",
    "ouserHost": "",
    "opayHost": "",

    "analysis": {
        "baiduHm": true, //百度统计
        "heimdall": true //跟踪云
    },
    "company": {
        "hotline": "0512-63828888-5022(5333)"
    },
    "share": {
        "defaultImg": "'http://cdn.oudianyun.com/prod1.0/dev/social/1508316062794_9732_82.png'"
    },
    "footer": {
        "showMiddle": true,
        "name": 'server',
        "url": '/serviceCenter/service-center.html',
        "title": '服务'
    },
    "center": {
        commonFunc: {
            // 客服热线
            showCustomer: {
                show: true,
                // 工作时间
                workingHours: "工作时间：早8点--凌晨1点",
                // 客服电话
                contact: "0512-63828888",
                // 分机..
                contactExt: "分机号：5022，5312"
            },
        },
        member: {
            // 欧普之家 定制化..
            showHouse: false,
        }
        
    },
    "order":{
        "showThirdParty":true
    }
};
config = _.merge(superConfig, config);

module.exports = config;