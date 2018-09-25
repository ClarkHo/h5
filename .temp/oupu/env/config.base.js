//#########
//#与company相关的业务相关配置
//##########

var config = {
    //图片懒加载的加载过程图
    "loadingImg": "http://cdn.oudianyun.com/lyf-local/branch/back-cms/1505980570453_2441_64.png",
    //拼团详情页加载过程图
    "pinTuanDefaultImg": "",
    //mob分享的appKey
    "appKey": "202cce063dd31",
    //高德地图的key
    "mapKey": "",
    "platformId": 3,  //H5
    "platform": 2,  //H5
    "pageCode": "H5_HOME",
    "businessType": 1,
    //用户类型
    "userPlatformId": 4, //运营后台传1 机构用户传2 普通用户传4
    "companyName":"SASS官方商城",//公司名称
    "afterSaleType": '1,2,4',   //只有退货
    "isO2O": false,
    "distributionType":1,//1、分销模式。0，非分销模式
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
        //微信跳转重定向的路径，如果需要用其他域名中转，则需要配这个
        "wx302Url": ""
    },
    //后台域名
    "adminHost": "",
    "contextPath": "",
    "askSwitch": true,//
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
    "footer": {
        showMiddle: true,
        url: "/serviceCenter/service-center.html",
        name: "serve",
        title: "服务"
    },
    "share": {
        "defautImg": ""//默认图片
    },
    // 个人中心配置
    "center": {
        common:{
            //签到
            showSign:true,
            //上方背景图
            bgImg:'${staticPath}/images/info-bg.png?v=${version}'
        },
        order: {
            show: true
        },
        wallet: {
            show: true,
            // 优惠券
            showCoupon: true,
            // 佣金
            showCommission: true,
            // 积分
            showPoint: true
        },
        commonFunc: {
            show: true,
            // 收货地址
            showAddress: true,
            // 增票资质
            showTicket: true,
            // 客服热线
            showCustomer: {
                show: true,
                // 工作时间
                workingHours: "",
                // 客服电话
                contact: "",
                // 分机..
                contactExt: ""
            },
            // 我的咨询
            showConsult: true,
            // 我的收藏
            showFavorites: true,
            // 我的评价
            showComment: true,
            // 我的足迹
            showFootprint: true,
            // 我的问答
            showQA: true
        },
        specialFunc: {
            show: true,
            // 我的服务单
            showServiceList: true,
            // 我的砍价单
            showPriceList: true,
            // 我的团
            showGroups: true,
            // 我的抽奖
            showLuckDraw: true,
            // 推荐购买
            showRecommend: true,
            // 邀请好友
            showInvite: true,
            // 我的优惠码
            showDiscountCode: true,
            // 试用中心
            showTrialCenter: true
        },
        member: {
            show: true,
            // 企业加盟
            showEnterpriseJoining: true,
            // 渠道资质上传
            showChannelQualifications: true,
            // 欧普之家 定制化..
            showHouse: false,
            // 快速下单
            showQuickOrder: true
        }
    },
    "order":{
        // 显示第三方订单
        "showThirdParty":false
    },
    // 详情页配置
    "detail":{
        //我的咨询
        showQA:true,
        //我的问答
        showConsult:true,
        //在线客服
        showHotOnline:true,
        //分享图标
        shareIcon:'icons icons-itemShare'
    },
    //设置界面配置
    "setting":{
        //关于我们
        showAboutUs:true
    }
};
module.exports = config;
