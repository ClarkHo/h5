//#########
//#与company相关的业务相关配置
//##########
var _ = require("lodash");
var superConfig = require("../../../core/env/config.base");

var config = {
    //图片懒加载的加载过程图
    "loadingImg": "http://cdn.oudianyun.com/yh2.0/prod/back-cms/201711/30/NQ/AA/1512015411028_7121_98.png",
    //mob appSchema
    "appSchema": "yh",
    //css，js，图片等静态文件根路径
    "dev": {
        "staticPath": "/1/h5_mall",
    },
    "test": {
        "staticPath": "/1/h5_mall",
    },
    "online": {
        "staticPath": "",
    },
    //后台域名
    "adminHost": "",
    "contextPath": "",
    "apiHost": "",
    "ouserHost": "",
    "opayHost": "",
    "analysis": {
        "baiduHm": false, //百度统计
        "heimdall": true //跟踪云
    },
    "footer": {
        showMiddle: false,
    },
    "center": {
        common:{
            showSign:false,
            bgImg:'${staticPath}/images/mycenter1.png?v=${version}'
        },
        order: {
            show: true
        },
        wallet: {
            show: true,
            // 优惠券
            showCoupon: true,
            // 佣金
            showCommission: false,
            // 积分
            showPoint: true
        },
        commonFunc: {
            show: true,
            // 收货地址
            showAddress: true,
            // 增票资质
            showTicket: false,
            // 客服热线
            showCustomer: {
                show: true,
                // 工作时间
                workingHours: "客服工作时间：每日9:00-22:30",
                // 客服电话
                contact: "400-830-9666",
                // 分机..
                contactExt: "转3号键"
            },
            // 我的咨询
            showConsult: false,
            // 我的收藏
            showFavorites: true,
            // 我的评价
            showComment: true,
            // 我的足迹
            showFootprint: true,
            // 我的问答
            showQA: false
        },
        specialFunc: {
            show: true,
            // 我的服务单
            showServiceList: false,
            // 我的砍价单
            showPriceList: true,
            // 我的团
            showGroups: true,
            // 我的抽奖
            showLuckDraw: true,
            // 推荐购买
            showRecommend: false,
            // 邀请好友
            showInvite: false,
            // 我的优惠码
            showDiscountCode: false,
            // 试用中心
            showTrialCenter: false
        },
        member: {
            show: false,
            // 企业加盟
            showEnterpriseJoining: false,
            // 渠道资质上传
            showChannelQualifications: false,
            // 欧普之家 定制化..
            showHouse: false,
            // 快速下单
            showQuickOrder: true
        }
    },
    "detail":{
        showQA:false,
        showConsult:false,
        showHotOnline:false,
        shareIcon:'icons icons-share'
    },
    //设置界面配置
    "setting":{
        //关于我们
        showAboutUs:false
    }
};

config = _.merge(superConfig, config);

module.exports = config;