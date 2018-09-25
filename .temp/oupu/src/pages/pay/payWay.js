/**
 * Created by Roy on 16/8/2.
 */
import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDialog from "../../components/ui-dialog.vue";
import config from "../../../env/config.js";
let regexCardnum = /^(\d{4}\s){0,3}(\d{0,4})$/;
let regexCardNum = /^(\d{4}\s){3}\d{4}$/;
let urlParams = Vue.utils.paramsFormat(window.location.href);
let orderCode = ''; //真实订单code
if(urlParams.orderCode &&urlParams.orderCode.indexOf('_') > 0) {
    orderCode = urlParams.orderCode.split('_')[0];
}else {
    orderCode = urlParams.orderCode;
}

let vm =new Vue({
    el: 'body',
    components: { UiHeader,UiDialog},
    data:{
        ut: Vue.auth.getUserToken(),
        isApp: Vue.browser.isApp(),
        orderCode:orderCode,
        payGateWays:[],
        commonPayGatewayList:[],
        order:{},
        payJumpUrl: '',
        payGateWayConfigId:'',
        isPaying:false,
        paymentThirdparty: '',
        returnUrl: Vue.utils.getPayBackUrl(urlParams.orderCode),
        openId: '',
        cancelTime:'',
        cancelTimeStr:'',
        timer:null,
        showRoleDialog: false,
        roleDialog: null,

        /* 亲密付 BEGIN */
        weixinSharePop: false,//微信分享弹窗
        browserSharePop: false,//游览器分享弹窗
        QRcodeState: false,//获取二维码状态
        shareConfig: {},
        helpPayWay:[],//支付方式
        helpPayWayState:false,//是否显示亲密付
        /* 亲密付 END */
        accountSummary:{},//账户余额
        yOrePay:1,//1为悠点卡，2为伊点卡
        yOrePayShow:false,//悠点卡、伊点卡支付弹窗
        payYCard:false,//伊点卡充值弹窗
        //伊点卡号
        cardCode: {
            value: '',
            flag: false
        },
        //伊点卡密码
        cardPwd: {
            value: '',
            flag: false
        },
        cardCodeValue:'',
        cardnumLength:0,
        oldCardValue:'',
        platformId: config.platformId,
        versionNo:'',
        yCardBalanceState:false,
        canUseUCard:0,
        canUseECard:0
    },
    watch:{
        payYCard:function(newValue){
            if(!newValue){
                this.resetNum();
                this.cardPwd.value = '';
            }
        }
    },
    ready:function(){
        this.loadOrderDetail();
        this.getPayGateway();
        //this.isEUAvaliable();
        if(Vue.browser.weixin()) {
            this.getOpenIdByCode();
        };
        this.roleDialog = {
            title: '确认离开收银台',
            content: '超过支付时效后订单将被取消，请尽快完成支付',
            btnOne: '继续支付',
            btnTwo: '确认离开',
            clickTwo: ()=> {
                location.replace('/my/my-order.html');
            }
        };

        /* 亲密付 BEGIN */
        this.shareRefStr = this.orderCode;
        // this.getShareInfo();// 获取分享信息
        this.getHelpPayWay();//获取代付支付方式
        /* 亲密付 END */
        //this.getAccountSummary();
    },
    methods:{
        isEUAvaliable:function(){
            var self = this;
            Vue.api.get(config.apiHost + "/api/cashier/lyfSupportPayment", null, (res) => {
                if(res.data){
                    self.canUseUCard = res.data.canUseUCard || 0;
                    self.canUseECard = res.data.canUseECard || 0;
                }
            });
        },
        addEcard:function (){
            if (!this.cardCode.value) {
                Vue.utils.showTips("请输入卡号");
                return;
            }
            if(!regexCardNum.test(this.cardCode.value)){
                Vue.utils.showTips('卡号格式错误');
                return;
            }
            if (!this.cardPwd.value) {
                Vue.utils.showTips("请输入密码");
                return;
            }

            var params = {cardCode: this.cardCodeValue, cardPwd: this.cardPwd.value, platformId: this.platformId,};
            Vue.api.postForm("/api/my/wallet/bindECard", params, (result) => {
                this.payYCard = false;
                Vue.utils.showTips("成功添加伊点卡");
                //重置状态
                this.cardCodeValue = "";
                this.cardCode.value = "";
                this.cardPwd.value = "";
                this.status = 1;
                // this.getAccountSummary();
            },(result) => {
                if(result.code == 50){
                    Vue.utils.showTips("绑定伊点卡失败");
                }
            });
        },
        resetNum:function (){
            this.cardCode.value = '';
            this.cardCodeValue = '';
            this.cardnumLength = 0;
            this.oldCardValue = ''
        },
        geduan:function(e){
            //使光标始终处于末尾
            var SearchInput = $(e.target);
            var strLength= SearchInput.val().length;
            SearchInput.focus();
            SearchInput[0].setSelectionRange(strLength, strLength);
            //删除末尾空格不处理
            if($.trim(this.cardCode.value) === $.trim(this.oldCardValue)){
                return;
            }
            
            //校验输入数字不合法
            if(!((/^(\d\s?)+$/).test(this.cardCode.value))){
                this.cardCode.value = this.oldCardValue;
                return;
            }
            //每隔四位增加空格
            var splitRE = /(\d{4})/g;
            var newValueStr = String(this.cardCode.value);
            var trimValue = newValueStr.replace(/\s+/g,'');
            this.cardCodeValue = Number(trimValue);
            this.cardnumLength = newValueStr.length;
            this.oldCardValue = this.cardCode.value = trimValue.replace(splitRE, '$1 ');
            //最后一个4位数字末尾空格不处理
            if(this.cardCode.value.length >= 19){
                this.cardCode.value = $.trim(this.cardCode.value);
                return;
            }
        },
        cancel:function () {
            this.yOrePayShow = false;
        },
        // LYF - 悠点卡、伊点卡
        getAccountSummary: function() {
            var params = {
                ut: this.ut,
                platformId: this.platformId,
                isECard:1,
                isYCard:1,
                cashe:Date.parse(new Date())
            };
            Vue.api.get(config.apiHost + "/api/my/wallet/summary", params, (res) => {
                this.accountSummary = res.data;
                if(res.data && res.data.yCardBalance !== null){
                    this.yCardBalanceState = true
                }
            });
        },
        //加载用户订单数据
        loadOrderDetail: function() {
            var self = this;
            var url=config.apiHost + "/api/my/order/detail";
            var params = {
                ut: this.ut,
                companyId:Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                v: '2.0'
            };
            Vue.api.get(url, params, (result) => {
                if(result.data.paymentAmount==0){
                    Vue.utils.showTips('支付成功');
                    setTimeout(() => {
                        location.replace("/pay/pay-success.html?orderCode="+orderCode);
                    },500);          
                }
                this.order = result.data||this.order;
                this.cancelTime = this.order.cancelTime;
                this.timeCountDownBegin();
                //跟踪云
                // try {
                //     if((document.referrer.indexOf('pay.html') > 0) || (self.paystate==1)){
                //         //从订单提交页过来
                //         window.eventSupport.emit('heimdallTrack',{
                //             ev: "6",
                //             oid: result.data.orderCode,
                //             otp: result.data.amount,
                //             sp: result.data.orderDeliveryFeeAccounting,
                //             prs: self.returnHeimdall(self.order.childOrderList),
                //             pc: result.data.totalCount
                //         })
                //     }
                // } catch(e) {
                //     //console.log(e);
                // }
            },()=>{

            });
        },
        // 获取支付方式
        getPayGateway:function(){
            var url=config.apiHost+'/api/checkout/getPayGateway';
            var params={
                companyId:Vue.mallSettings.getCompanyId(),
                platformId:config.platformId,
                ut:this.ut,
                orderCode:this.orderCode,
                businessType:1//普通支付
            }
            function filterThirdparty(arr){
                if(arr.length>0){
                    for(var i=0;i<arr.length;i++){
                        "use strict";
                        if (!Vue.browser.weixin() && arr[i].paymentThirdparty.indexOf('微信') >= 0) {
                            arr.splice(i, 1);
                        }
                        if(Vue.browser.weixin() && arr[i].paymentThirdparty.indexOf('支付宝') >= 0) {
                            arr.splice(i, 1);
                        }
                    }
                }
            }
            Vue.api.postForm(url, params, (res)=> {
                this.payGateWays=res.data.payGatewayList||this.payGateWays;
                this.commonPayGatewayList=res.data.commonPayGatewayList||this.commonPayGatewayList;
                //如果在非微信端有微信支付,需要过滤掉
                filterThirdparty(this.payGateWays);
                filterThirdparty(this.commonPayGatewayList);
            })
        },
        //支付前确认库存
        payBeforeStock:function(pay){
            var url=config.apiHost+'/back-order-web/restful/order/validateWarehouseStock.do';
            var params={
                ut:this.ut,
                orderCode:this.orderCode,
            }
            Vue.api.postForm(url, params, (res)=> {
                if(res.data.result == 1){
                    this.createPay(pay);
                }else{
                    $.tips({
                        content: res.data.errorMessage,
                        stayTime: 2000,
                        type: "warn"
                    });
                }
            })
        },
        // LYF-去支付
        createPay:function(pay){
            var self = this;
            this.paymentThirdparty = pay.paymentThirdparty;
            this.paymentConfigId = pay.paymentConfigId;
            this.promotionId = pay.promotionId;
            this.payJumpUrl = pay.payJumpUrl;
            if(pay.paymentThirdparty.indexOf('微信') > -1 && !this.openId) {
                setTimeout(() => {
                    this.createPay(pay);
                }, 300);
                return;
            }

            let url = config.apiHost + "/api/cashier/createPay";
            let params = {
                ut: this.ut,
                paymentConfigId: this.paymentConfigId,//支付网关id
                orderCode: this.orderCode,
                promotionId: this.promotionId,//支付优惠促销id
                openid: this.openId,
                returnUrl: this.returnUrl,
            };
            //heimdall埋点
            try{
                window.eventSupport.emit('heimdallTrack',{
                    ev: "7",
                    oid: self.order.orderCode,
                    otp: self.order.paymentAmount,
                    sp: self.order.orderDeliveryFeeAccounting,
                    pm: self.paymentThirdparty,
                    prs: self.returnHeimdall(self.order.childOrderList),
                    pc: self.order.totalCount
                });
            }catch(err){
                console.log(err);
            }
            Vue.api.postForm(url, params, (result)=> {
                if (result.data) {
                    if(this.paymentThirdparty.indexOf('支付宝') > -1) {
                        if(Vue.browser.weixin()) {
                            window.location.href='/pay/pay-for-weixin.html?orderNo='+this.orderCode+'&alipayUrl=' + encodeURIComponent(result.data.paymentMessage.od);
                        }else {
                            window.location.href=result.data.paymentMessage.od;
                        }
                    }else if(this.paymentThirdparty.indexOf('微信') > -1) {
                        WeixinJSBridge.invoke('getBrandWCPayRequest', {
                            "appId" : result.data.paymentMessage.appid, //公众号名称，由商户传入
                            "timeStamp" : result.data.paymentMessage.timestamp, //时间戳，自1970年以来的秒数
                            "nonceStr" : result.data.paymentMessage.noncestr, //随机串
                            "package" : 'prepay_id=' + result.data.paymentMessage.prepayid,
                            "signType" : 'MD5', //微信签名方式:
                            "paySign" : result.data.paymentMessage.sign
                        }, (res) => {
                            if (res.err_msg == "get_brand_wcpay_request:ok") {
                                location.href = this.returnUrl;
                            } else {
                                //alert('失败');
                            }
                        });
                    }else if(this.paymentThirdparty.indexOf('银联') > -1){
                        this.payJumpUrl = result.data.paymentMessage.od;
                        $('#submitForm').attr('action', this.payJumpUrl).submit();
                    }
                }
            }, (res)=> {})

        },
        // 去支付 old-desheng
        pay:function(){
            this.isPaying=true;
            if(this.paymentThirdparty.indexOf('银联') > -1) {
                $('#submitForm').attr('action', this.payJumpUrl).submit();
                this.isPaying = false;

            }else {
                if(this.paymentThirdparty.indexOf('微信') > -1 && !this.openId) {
                    setTimeout(() => {
                        this.pay();
                    }, 300);
                    return;
                }
                // var url=config.opayHost + "/opay-web/createPay.do";
                var url = this.payJumpUrl;
                var params = {
                    orderNo: this.orderCode,
                    money: this.order.paymentAmount,
                    paymentConfigId: this.payGateWayConfigId,
                    returnUrl: this.returnUrl,
                    openId: this.openId
                };

                Vue.api.postForm(url, params, (result) => {
                    if (result.data) {
                        if(this.paymentThirdparty.indexOf('支付宝') > -1) {
                            if(Vue.browser.weixin()) {
                                window.location.href='/pay/pay-for-weixin.html?orderNo='+this.orderCode+'&alipayUrl=' + encodeURIComponent(result.data.od);
                            }else {
                                window.location.href=result.data.od;
                            }
                        }else if(this.paymentThirdparty.indexOf('微信') > -1) {
                            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                                "appId" : result.data.appid, //公众号名称，由商户传入
                                "timeStamp" : result.data.timestamp, //时间戳，自1970年以来的秒数
                                "nonceStr" : result.data.noncestr, //随机串
                                "package" : 'prepay_id=' + result.data.prepayid,
                                "signType" : 'MD5', //微信签名方式:
                                "paySign" : result.data.sign
                            }, (res) => {
                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                    location.href = this.returnUrl;
                                } else {
                                    //alert('失败');
                                }
                            });
                        }
                    }

                    this.isPaying=false;
                }, ()=> {
                    this.isPaying=false;
                });
            }
        },
        // 获取openId
        getOpenIdByCode: function (fn) {
            var url = config.apiHost + "/api/weixin/getWxPayOpenIdByCode";
            var params = {
                code: urlParams.code
            };
            Vue.api.get(url, params, (res) => {
                this.openId = res.data.data;
            })
        },
        gotoCenter:function(){
            this.showRoleDialog = true;
        },
        //返回跟踪云可用字符串
        returnHeimdall: function (data) {
            var str = [];
            for(var i in data) {
                for(var j in data[i].packageList) {
                    for(var k in data[i].packageList[j].productList) {
                        str.push({pri:data[i].packageList[j].productList[k].mpId,prm:data[i].packageList[j].productList[k].num,prp:data[i].packageList[j].productList[k].originalPrice});
                    }
                }
            }
            str = str.substring(0, str.length-1);
            str = '[' + str + ']';
            return str;
            //$('#heimdall_el').attr('heimdall_products', str);
        },
        // 倒计时
        timeCountDown:function () {
            this.cancelTime = this.cancelTime - 1;
            var d = Math.floor(this.cancelTime / 60 / 60 / 24);
            var h = Math.floor(this.cancelTime / 60 / 60 % 24);
            var m = Math.floor(this.cancelTime / 60 % 60);
            var s = Math.floor(this.cancelTime  % 60);
            this.cancelTimeStr = (this.formatTime(d)>0?this.formatTime(d)+"天":'') + (this.formatTime(h)>0?this.formatTime(h)+"时":'') + this.formatTime(m) +"分"+ this.formatTime(s) +"秒";
        },
        timeCountDownBegin:function () {
            var timer = setInterval(() => {
                if(this.cancelTime > 0){
                    this.timeCountDown();
                }else{
                    if(this.order.orderStatus==1){
                        clearInterval(timer);
                        this.sysCancelOrder();
                        $.tips({
                            content: '该订单已失效',
                            stayTime: 2000,
                            type: "warn"
                        });
                        setTimeout(()=>{
                            location.replace('/my/order-detail.html?pay=1&orderCode='+orderCode);
                        }, 2000);
                    }else if(this.order.orderStatus == 10) {
                        location.replace('/my/order-detail.html?pay=1&orderCode='+orderCode);
                    }else{
                        location.replace("/pay/pay-success.html?orderCode="+orderCode);
                    }

                }
            },1000)
        },
        //系统取消订单
        sysCancelOrder: function() {
            if (!this.orderCode) {
                return;
            }
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                cancelOperateType: 1
            };
            Vue.api.postForm(config.apiHost + "/api/my/order/cancel", params, (res) => {});
        },
        formatTime: function (time) {
            return time >= 10 ? time : "0" + time;
        },
        // 重加载
        reloadPage: function () {
            window.location.reload();
        },


        /*  亲密付 BEGIN */
        // 点击 亲密付
        helpBuy:function () {
            if(Vue.browser.weixin()){
                // 微信分享
                this.weixinSharePop = true;

            }else{
                // 游览器
                if(this.QRcodeState){

                    this.browserSharePop = true;

                }else{
                    // 生成二维码失败
                    event.stopPropagation();

                    var dialog = $.dialog({
                        title: "",
                        content: "ooops ~ ,生成二维码失败，请复制链接到微信进行亲密付",
                        button: ["我知道了"]
                    });

                    dialog.on("dialog:action", (e)=> {
                        if (e.index == 0){}
                    });
                };

            }
        },
        // 获取亲密付支付方式 - 葛兴元 http://wiki.odianyun.local/pages/viewpage.action?spaceKey=HTB&title=HTTP
        getHelpPayWay: function() {
            var params = {
                channelType: 1,
            };
            Vue.api.postForm("/opay-web/paymentConfig/getPayChannel.do", params, (res) => {
                if(res.data && res.data.length >= 0){
                    this.helpPayWay = res.data[0];
                    this.helpPayWayState = true;
                }
            });
        },
        // 获取分享信息
        getShareInfo:function () {
            var params = {
                ut: Vue.auth.getUserToken(),
                type: 5,
                platformId: config.platformId,
                shareRefStr: this.shareRefStr,
                shareType: 0,
            };
            Vue.api.postForm("/api/share/shareInfo", params, (res) => {
                this.shareConfig = {
                    link: res.data.linkUrl,
                    title: res.data.title,
                    desc: res.data.content,
                    imgUrl: res.data.url160x160
                };

                // 生成二维码
                var qrcode = new QRCode(document.getElementById("qrcode"), {
                    width: 220,
                    height: 220
                });
                qrcode.makeCode(res.data.linkUrl);

                this.QRcodeState = true;

                // 微信分享
                Vue.weixin.weixinShareOnlyFriend(this.shareConfig);
            });
        },
        /*  亲密付 END */
        showEUPop:function(eupay){
            this.yOrePay=eupay;
            this.yOrePayShow=true;
        },
        EAndUPay:function(){
            var self = this;
            var params = {
                ut:self.ut,
                orderCode:self.orderCode,
                versionNo:self.order.versionNo,
                payMethod:self.yOrePay
            }
            Vue.api.postForm("/api/cashier/payByCard", params, (res) => {
                self.yOrePayShow=false;
                if(res.data){
                    self.loadOrderDetail();
                    self.getAccountSummary();
                }
            },(res) =>{
                self.yOrePayShow=false;
                Vue.utils.showTips(res.message);
            });
        }
    }
})