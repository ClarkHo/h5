import Vue from "vue";
import UiFooter from "../../components/ui-footer.vue";
import UiDialog from "../../components/ui-dialog.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiMessage from "../../components/ui-message.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);
//隐藏api请求可能出现的loading mask
Vue.api.hideLoading = true;
Vue.api.unknownError = '网络不给力，请稍后再试';

var vm = new Vue({
    el: 'body',
    components: { UiFooter,UiDialog,UiActionsheet,UiMessage,UiDropDown
    },
    data: {
        //是否在app里运行
        isApp: Vue.browser.isApp(),
        //是否支持分销功能
        supportDistribution: false,
        loggedIn: Vue.auth.loggedIn(),
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),
        accountSummary: [] , //账号概况
        accountSummary_myIncome:0,
        accountSummary_point:0,
        accountSummary_coupon:0,
        pointList:[],
        pointStatus: 0,
        pageNo: 1,
        pageSize: 10,
        //可用积分
        amountBalance: 0,
        // 注册信息
        logonInfo:{},
        showTalk:false,
        showRoleDialog: false,
        amountFreezed:0,
        roleDialog: {
            content: '你还未开通店铺功能，赶紧加入我们吧！',
            btnOne: '知道了',
            btnTwo: '如何开店',
            clickTwo: null
        },
        currentTab: urlParams.t ==1 ? 1: 0,
        vatInvoice:'',
        platformId: config.platformId,
        orderSummaryState:[],
        kfConfig: null,
        yCardBalanceState:false,
        //stopDropDown: false,
        is6plus:false,
        isDistributor:0,//是否显示分销商信息
        incomeOverview:[],//收入概况
        shop_guide:[],//开店说明
        identityType:{
            "7":"加盟门店",
            "41":"内购会员",
            "42":"企业会员",
            "43":"渠道会员" 
        },
        identityTypeCode:null,
        memberInfo:'',//会员信息
        sysSource:'ody',//String	系统来源 目前：ody:平台自营 op:第三方
        orderType:0	//Integer	订单类型:0 普通 1 生鲜类 2 服务类 3 虚拟’,
    },
    computed:{
        pageConfig:function () {
            return config.center || {};
        }
    },
    ready: function() {
        // this.init();
        //页面再次显示时
        var menuBox = $('.menu');
        menuBox.forEach((item) => {
            if(item.children.length == 4){
                $(item).addClass("equalFour");
            }
            if(item.children.length < 4){
                $(item).addClass("underFour");
            }
        })
        Vue.event.on("pageShow", this.pageShowHandler);
        window.onpageshow =  (res) => {
            //以下代码针对安卓 防止ut不同步显示信息错误
            // console.log(res)
            // if(res && !res.ut) {
            //     Vue.auth.deleteUserToken();//清除UT
            //     this.loggedIn = false;
            //     this.ut = '';
            //     this.accountSummary = [];
            //     this.accountSummary_yCardBalance = 0;
            //     this.accountSummary_eCardBalance = 0;
            //     this.accountSummary_point = 0;
            //     this.accountSummary_coupon = 0;
            //     this.logonInfo = {};
            //     this.vatInvoice = '';
            //     this.orderSummaryState = [];
            // }
            this.init();
        }
        if(window.screen.width > 400){
            this.is6plus = true;
        }

        
    },
    methods: {
        goOneWord:function () {
            if(this.loggedIn){
                window.location.href = '${redPacket}/wap/wordgetcoupon.html?session=' + Vue.auth.getUserToken() + '&source=' + encodeURIComponent(Vue.utils.getHost())
            } else{
                location.href = '/login.html?from=/my/home.html';
            }
        },
        // dropDown: function () {
         //    this.init();
		// 	setTimeout(() => {
		// 		this.stopDropDown = true;
		// 	}, 2000);
		// },
        //跳转判断
        openDistributorLink: function (url) {
            //如果未登录，先登录
            if (!this.loggedIn) {
                window.location.href = "/login.html?from=/my/home.html";
                return;
            }
            // 如果是分销商
            if(this.logonInfo.isDistributor) {
                location.href = url;
            }else {
                location.href = '/my/noDistributor.html'
            }
        },
        //唤起app客服
        goCustomService:function () {
            if(Vue.browser.isApp()) {
                if(this.loggedIn) {
                    Vue.app.postMessage("callcustomservice");    
                }else {
                    //location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                    location.href = '${appSchema}://login';
                }
            }else if(Vue.browser.weixin()) {
                var dia=$.dialog({
                    title:'温馨提示',
                    content:'请点击右上角菜单选择“在浏览器打开”',
                    button:["知道了"]
                });
            }else {
                if(!this.loggedIn || !Vue.localStorage.getItem('username')) {
                    location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                    return;
                }
                this.getKFConfig((data) => {
                    this.getUserHeadPic(() => {
                        location.href = '/kf.html?ak=' + data.appKey + 
                                        '&pwd=' + data.password + 
                                        '&rid=' + data.receiveId;
                    });
                        
                });
            }
        },
        goredPod:function () {
            if(this.loggedIn) {
                Vue.app.postMessage("goredPod");
            }else {
                //location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                location.href = '${appSchema}://login';
            }
        },
        //获取客服配置
        getKFConfig: function (callback) {
            if(this.kfConfig) {
                if(typeof callback == 'function') {
                    callback(this.kfConfig);
                }
            }else {
                var url = '/search-backend-web/getTaoBaoOpenIM.json';
                var params = {
                    platform: config.platform,
                    areaCode: Vue.area.getArea().aC,
                    platformId: config.platformId,
                    sessionId: Vue.session.getSessionId(),
                    userId: Vue.localStorage.getItem('username'),
                    companyId: Vue.mallSettings.getCompanyId()
                };
                Vue.api.get(url, params, (res) => {
                    if(res.data.appKey && res.data.password && res.data.receiveId) {
                        this.kfConfig = {
                            appKey: res.data.appKey,
                            password: res.data.password,
                            receiveId: res.data.receiveId
                        }
                        if(typeof callback == 'function') {
                            callback(this.kfConfig);
                        }
                    }
                }, ()=> {
                    
                });
            }

        },
        //获取用户头像
        getUserHeadPic: function (callback) {
            var headPic = Vue.sessionStorage.getItem('kf_head_pic');
            if(headPic) {
                if(typeof callback == 'function') {
                    callback();
                }
            }else {
                var url = config.apiHost + '/api/my/user/info';
                var param = {
                    ut: Vue.auth.getUserToken(),
                    companyId: Vue.mallSettings.getCompanyId()
                };
                Vue.api.postForm(url, param, (res) => {
                    Vue.sessionStorage.setItem('kf_head_pic', res.data.url100x100);
                    if(typeof callback == 'function') {
                        callback();
                    }
                });
            }
                
        },
        //app显示该页时会触发该事件
        pageShowHandler: function (res) {
            //以下代码针对安卓 防止ut不同步显示信息错误
            if(res && !res.ut) {
               // Vue.auth.deleteUserToken();//清除UT
                this.loggedIn = false;
                this.ut = '';
                this.accountSummary = [];
                this.accountSummary_yCardBalance = 0;
                this.accountSummary_eCardBalance = 0;
                this.accountSummary_point = 0;
                this.accountSummary_coupon = 0;
                this.logonInfo = {};
                this.vatInvoice = '';
                this.orderSummaryState = [];
            }else if(res && res.ut) {
                Vue.auth.setUserToken(res.ut);
                this.loggedIn = true;
                this.ut = res.ut;
            }
            this.init();
        },

        init: function () {
             // this.checkSupportDistribution();
            if (this.loggedIn) {
                //有佣金配置项时，才去查佣金
                if(this.pageConfig.wallet.showCommission){
                    this.getUserPoint();
                }
                this.getLogonInfo();
                this.getOrderSummaryState();
                this.userInfoDetail();
                this.getAccountSummary();
                // this.getIncomeOverview();
            }
            this.roleDialog.clickTwo = this.goHelp;
        },

        // 订单各状态数量
        getOrderSummaryState: function() {
            var params = {
                ut: this.ut,
                orderStatus: this.orderStatusm,
                sysSource: this.sysSource
            };
            Vue.api.get(config.apiHost + "/api/my/order/summary", params, (res) => {
                this.orderSummaryState = res.data;
            });
        },
        // //检查是否支持分销功能
        // //TODO 需要优化cache
        // checkSupportDistribution: function () {
        //     var params = { data: { companyId: this.companyId, mainModule:"AGENT_MODULE",subModule:""} };
        //     Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
        //         this.supportDistribution = result.resultData == 1;
        //     });
        // },

        //打开分销商页面链接
        // openDistributorLink: function (url) {
        //     //如果未登录，先登录
        //     if (!this.loggedIn) {
        //         if (Vue.browser.isApp()) {
        //             //跳转到app登录页面
        //             window.location.href = "${appSchema}://login";
        //         } else {
        //             window.location.href = "/login.html?from=/my/home.html";
        //         }
        //
        //         return;
        //     }
        //
        //     if(this.logonInfo.isDistributor) {
        //         location.href = url;
        //     }else {
        //         this.showRoleDialog = true;
        //     }
        // },

        //跳转至帮助中心
        goHelp: function () {
            location.href = '/help/help.html';
        },
        // 获取用户注册信息
        getLogonInfo: function() {
            var params = {
                ut: this.ut,
                companyId: this.companyId,
                cashe:Date.parse(new Date())
            };
            Vue.api.get(config.apiHost + "/api/my/user/info", params, (result) => {
                Vue.sessionStorage.setItem('kf_head_pic', result.data.url100x100);
                this.logonInfo = result.data;
                this.isDistributor =  result.data.isDistributor;
                // this.honeTable();
                // setTimeout(honeTable,50)
            });
        },
        quit: function() {
            if (this.loggedIn) {
                var url = config.ouserHost + "/ouser-web/mobileLogin/exit.do";
                var dataCall = {
                    ut: this.ut
                }
                Vue.api.get(url, dataCall, () => {
                    Vue.auth.deleteUserToken();
                    this.loggedIn = false;
                });
            }
        },
        // 账户概况
        getAccountSummary: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get(config.apiHost + "/api/my/accountSummary", params, (res) => {
                this.accountSummary = res.data;
                this.accountSummary_point = Math.ceil(res.data.pointBalance);
                this.accountSummary_coupon = Math.ceil(res.data.usableCouponNum);
                this.accountSummary_myIncome = Math.ceil(res.data.myIncome);
            });
        },
        // LYF - 判断用户是否已填写增票资质
        ckVAT: function () {
            let params = {
                companyId: this.companyId,
                ut: this.ut
            };
            Vue.api.post("/api/my/showVATInvoice", params, (result) => {
                this.vatInvoice = result.data.userId;
                if(!this.loggedIn){
                    if(Vue.browser.isApp()){
                        //跳转到app登录页面
                        window.location.href = "${appSchema}://login";
                    }else{
                        //跳转到h5登录页面
                        window.location.href = "/login.html?from=/my/home.html";
                    }
                }
                else{
                    if(this.vatInvoice){
                        document.location.href='/VAT/vat-edit.html';
                    }else{
                        document.location.href='/VAT/vat.html';
                    }
                }
            },() => {
                if(!this.loggedIn){
                    if(Vue.browser.isApp()){
                        //跳转到app登录页面
                        window.location.href = "${appSchema}://login";
                    }else{
                        //跳转到h5登录页面
                        window.location.href = "/login.html?from=/my/home.html";
                    }
                }else{
                    document.location.href='/VAT/vat.html';
                }
            });
        },

        //切换tab
        switchTab: function(tab) {
            if (this.currentTab != tab) {
                this.currentTab = tab;
                //更新url的参数
                var url = location.pathname;
                if(tab > 0) {
                    url += "?t=" + tab;
                }
                window.history.replaceState(null, "", url);
            }
        },
        // 如果是APP,跳APP地址管理页
        gotoAddress:function(){
            "use strict";
            if(Vue.browser.isApp()){
                if(!Vue.auth.loggedIn()){
                    //跳转到app登录页面
                    window.location.href = "${appSchema}://login";
                }else{
                    document.location = '${appSchema}://addressManager'
                }
            }else{
                if(!Vue.auth.loggedIn()){
                    //跳转到h5登录页面
                    window.location.href = "/login.html?from=/my/home.html";
                }else{
                    document.location.href='/my/address-manage.html'
                }
            }
        },
        //收益概况
        getIncomeOverview: function() {
            var params = {
                ut: this.ut
            };
            if(ut == null || ut == ""){
                return;
            }
            Vue.api.postForm(config.apiHost + "/back-finance-web/api/commission/queryCommissionAmountByPeriod.do", params, (res) => {
                if(!res.data) return;
                this.incomeOverview = res.data;
            });
        },
        //说明链接
        getExplainUrl: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: "H5_PERSONAL_CENTER_PAGE",
                adCode: 'shop_guide',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data.shop_guide&&res.data.shop_guide[0]&&res.data.shop_guide[0].linkUrl){
                    this.shop_guide = res.data.shop_guide;
                    location.href = this.shop_guide[0].linkUrl;
                }

            });
        },
        //用户线 获取用户信息（类型）
        userInfoDetail:function(){
            var url = config.apiHost + '/ouser-center/api/user/info/detail.do';
            var param = {
                identityTypeCode:4//4:普通会员 41:内购 42:企业 43:渠道会员
            }
            Vue.api.postForm(url,param,res => {
                if(res.data && res.data.userInfo && res.data.userInfo.identityTypeCode){
                    this.identityTypeCode = res.data.userInfo.identityTypeCode;
                    this.memberInfo = res.data.memberInfo;
                }else{
                    Vue.utils.showTips(res.message || '请稍后再试');
                }
            })
        },
        getUserPoint: function () {
            let params = { ut: Vue.auth.getUserToken() };
            Vue.api.postForm("/back-finance-web/api/commission/queryCommissionAccount.do", params, (result) => {
                let data = result.data;
                if (data) {
                    this.amountBalance = data.availableAccountAmount;
                }
            });
        },
    }
});
