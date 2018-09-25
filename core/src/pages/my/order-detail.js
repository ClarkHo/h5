import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiCountDown from "../../components/ui-count-down.vue";
import config from "../../../env/config.js";
import UiScrollTop from "../../components/ui-scroll-top.vue";
import UiOrderBtn from "../../components/ui-order-btn.vue";
import UiGuessLike from "../../components/ui-guess-like.vue";
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload,{
    loading:config.defaultImg
});


let urlParams = Vue.utils.paramsFormat(window.location.href);
const sessionId = Vue.session.getSessionId();
new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheetPop ,UiScrollTop,UiActionsheet,UiCountDown,UiOrderBtn,UiGuessLike},
    data: {
        //当前用户的usertoken
        ut: Vue.auth.getUserToken(),
        loggedIn: Vue.auth.loggedIn(),
        kfConfig: null,
        //订单编号
        orderCode: null,
        //订单列表
        order: {},
        cancleTimeStr: "",
        //是否显示售后按钮
        enableAfterSale: false,
        orderListType: urlParams.seller ? 1 : 0,
        orderDetailUrl: urlParams.seller ? config.apiHost + "/api/seller/order/detail" : config.apiHost + "/api/my/order/detail",
        showReturnCause: false,
        afterSaleCauseList: [], //退货原因列表
        recoList: [],      //猜你喜欢
        invoice:[],
        childOrderList:[],
        pageSize:10,
        pageNo:1,
        mpIds:'',
        showTalk: false,
        showDelete:false,
        rightNavFlag:false,
        invoiceContentState:false,
        showMoreBtn: false,
        showAgainBuy: false,
        availableProductList: [],
        diaShow:false,
        error:false,
        orderInfo:{},
        orderMsg:[],
        serviceOrderStatus:[],//服务订单安装进度状态
        packageCode:null,//包裹编号,
        unfold:true,
        msgUrl: config.adminHost + '/back-order-web/restful/order/deliveyInfo.do',
        showCountDown:true
    },

    //初始化
    ready: function() {
        //parser orderCode from url params

        this.orderCode = urlParams.orderCode;
        this.loadOrderDetail();
        // if(urlParams.seller != 1) {
        //     this.getAfterSaleStatus();
        // }
    },
    computed: {
        allmpIds: function () {
            var mpIds = [];
            this.childOrderList.forEach((item) => {
                item.orderProductList.forEach((v) => {
                    mpIds.push(v.mpId);
                })
            })
            return mpIds;
        },
        title:function(){
            return this.order.orderType2 == 2 ? '服务订单' : '订单详情';
        },
        //
        msgChk: function () {
            //0个 或者 最后一个 或者chked
            return true
        }
    },
    methods: {
        //轮播
        initSwipe2: function () {
            Vue.nextTick(function () {
                var points = $('#slider2 .swipe-point li');
                Swipe(document.getElementById('slider2'), {
                    auto: false,
                    continuous: true,
                    disableScroll: false,
                    callback: function (i, ele) {
                        points.removeClass('active').eq(i).addClass('active');
                    }
                });
            })
        },
        //加载用户订单数据
        loadOrderDetail: function() {
            var params = {
                orderCode: this.orderCode,
                v: '2.2'
            };
            Vue.api.postForm(this.orderDetailUrl+"?t="+new Date().getTime(), params, (result) => {
                this.order = result.data;
                if(this.order.invoice.invoiceContent != null){
                    this.invoiceContentState = true
                }

                this.childOrderList= this.childOrderList.concat(result.data.childOrderList);
                //获取包裹信息，进而获取包裹的快递物流信息
                this.getNewOrderMessage(this.childOrderList[0].orderCode);
                this.getCancleTime(this.order.cancelTime);

                this.getRecoList(this.allmpIds);
                
            }, (result) => {
                if(result.code == '11001ORDER_STATUS_ERROR' || result.code == '11001ORDER_DETAIL_ERROR'){
                    this.error = true;
                    Vue.utils.showTips(result.message);
                    setTimeout(function(){
                        if(Vue.browser.isApp()){
                            Vue.app.back();
                        } else{
                            history.back();
                        }
                    },1000)
                }
            });

        },

        //获取是否可退换货状态
        // getAfterSaleStatus: function() {
        //     var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: this.orderCode };
        //     Vue.api.get(config.apiHost + "/api/my/orderAfterSale/isAfterSale", params, (result) => {
        //         if (result.data) {
        //             this.enableAfterSale = result.data.isAfterSale == 1;
        //         }
        //     },() =>{
        //
        //     });
        // },

        getCancleTime: function(cancleTime) {
            var _this = this;
            var ct = cancleTime;
            _this.cancleTimeStr = _this.timeSwitch(ct);
            var timeChange = setInterval(function() {
                ct = ct - 1;
                //倒计时完
                if (ct == 0) {
                    clearInterval(timeChange);
                    //更改订单为已取消状态
                     _this.order.orderStatus = 10;
                }
                _this.cancleTimeStr = _this.timeSwitch(ct);
            }, 1000)
        },
        timeSwitch: function(time) {
            time = parseInt(time);
            if (time <= 0) time = 0;
            var s = time >= 60 ? time % 60 : time;
            var m = parseInt((time >= 3600 ? time % 3600 : time) / 60);
            var h = parseInt((time >= 86400 ? time % 86400 : time) / 3600);
            var d = parseInt(time / 86400);
            d = d == 0 ? '' : d + '天';
            h = h == 0 && d == '' ? '' : h + '小时';
            m = m == 0 && h == '' ? '' : m + '分';
            s = s == 0 && m == '' ? '' : s + '秒';
            return d + h + m + s;
        },

        //订单支付
        //pay: function () {
        //    var params = {
        //        orderNo: this.order.orderCode,
        //        money: this.order.amount,
        //        paymentConfigId: 36,
        //        returnUrl: Vue.utils.getPayBackUrl(this.order.groupBuyOrderCode)
        //    };
        //
        //    Vue.api.postForm(config.opayHost + "/opay-web/getPayInfoByOrderNo.do", params, (result) => {
        //        if (result.data && result.data.od) {
        //            window.location.href=result.data.od;
        //        }
        //    });
        //},

        //确认收货
        confirmReceived: function(order) {
            var dialog = $.dialog({
                title: "",
                content: "您确定收货吗？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: this.ut, orderCode: order.orderCode };
                    Vue.api.postForm(config.apiHost + "/api/my/order/confirmReceived", params, (result) => {
                        //更改订单为已完成
                        order.orderStatus = 8;

                    });
                    location.href = '/order/order-suc.html?orderCode='+order.orderCode + '&mpId=' + this.order.childOrderList[0].packageList[0].productList[0].mpId;
                }
            });
        },
 
        cancelOrder: function() {
            if (!this.order.orderCode) {
                return;
            }
            document.location.href='/order/cancelOrderReason.html?orderCode='+ this.order.orderCode;

            // var dialog = $.dialog({
            //     title: "",
            //     content: "您确定要取消订单吗？",
            //     button: ["取消", "确认"]
            // });
            //
            // dialog.on("dialog:action", (e) => {
            //     //点击确定按钮
            //     if (e.index == 1) {
            //         var params = { ut: this.ut, companyId: Vue.mallSettings.getCompanyId(), orderCode: this.orderCode };
            //         Vue.api.postForm(config.apiHost + "/api/my/order/cancel", params, (result) => {
            //             //更改订单为已取消状态
            //             this.order.orderStatus = 10;
            //         });
            //     }
            // });
        },
        //打开退货原因列表
        openCauseList: function() {
            this.getAfterSaleCauseList();
            this.showReturnCause = true;
        },

        //获取退货原因列表
        getAfterSaleCauseList: function() {
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                afterSaleType: 1
            };
            Vue.api.get(config.apiHost + "/api/my/orderAfterSale/afterSaleCauseList", params, (res) => {
                this.afterSaleCauseList = res.data.orderAfterSalesCauseVOs;
            });
        },

        //选择退换货原因
        selectCause: function(cause) {
            this.showReturnCause = false;
            var params = {
                ut: this.ut,
                companyId: Vue.mallSettings.getCompanyId(),
                orderCode: this.orderCode,
                refundReasonId: cause.key,
                refundRemark: cause.value
            };
            Vue.api.postForm(config.apiHost + "/api/my/orderAfterSale/applyRefund", params, (result) => {
                this.loadOrderDetail();
                $.tips({
                    content: '已成功申请退货，请在售后服务查看进度。',
                    stayTime: 2000,
                    type: "success"
                });
            });
        },

        //删除订单
        deleteOrder: function (order) {
            if (!order) {
                return;
            }

            var dialog = $.dialog({
                title: "",
                content: "<div class='text-center'>您确定删除订单吗？</div>",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                this.showMoreBtn = false;
                e.preventDefault();
                e.stopPropagation();
                //点击确定按钮
                if (e.index == 1) {
                    var params = { ut: this.ut, orderCode: order.orderCode, companyId: Vue.mallSettings.getCompanyId() };
                    Vue.api.postForm("/api/my/order/delete", params, (result) => {
                        // this.loadOrderDetail();
                        Vue.utils.showTips("成功删除订单");
                        setTimeout(()=>{
                            this.goback();
                        }, 1000);
                    });
                }
            });
        },

        goback: function() {
            if (urlParams.refer == "common" || urlParams.refer == "aftersale") {
                history.back();
            } else if(urlParams.seller) {
                location.href = '/my/my-order.html?seller=1';
            } else if(urlParams.pay){
                if (Vue.browser.isApp()) {
                    document.location = '${appSchema}://shoppingCar';
                } else {
                    document.location.href = '/cart.html';
                }
            }
            else {
                if (Vue.browser.isApp()) {
                    Vue.app.back(true);
                } else {
                    // location.href = '/my/my-order.html';
                    history.back();
                }
            }
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.prod-img img').width();
                $('.prod-img img').height(width);
            })
        },
        //猜你喜欢
        getRecoList: function (mpIds) {
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                sceneNo:1,
                ut:Vue.auth.getUserToken(),
                pageSize: 20,
                pageNo: 1,
                platformId: config.platformId,
                mpIds:mpIds.join(","),//商品id
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data && res.data.dataList.length>0) {
                    var itemIds=[];
                    for(let p of res.data.dataList){
                        itemIds.push(p.mpId)
                    }
                    itemIds = itemIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(itemIds,res.data.dataList,null,(obj)=> {
                        var list = [];
                        var temp = [];
                        for (var i in obj) {
                            if (i % 4 == 0) {
                                temp = [];
                            }
                            temp.push(obj[i]);
                            if (i % 4 == 0) {
                                list.push(temp);
                            }
                        }
                        this.recoList = list;
                        this.resizeImgHeight();
                        this.initSwipe2();
                    })
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //申请售后
        applyAfterSale:function(order){
            if (!order) {
                return;
            }
            if( this.order.orderStatus != 8){

                var dialog = $.dialog({
                    title: "",
                    content: "您还没有确认收货，是否确认收货后继续售后申请",
                    button: ["取消", "确认收货"]
                });

                dialog.on("dialog:action", (e) => {
                    //点击确定按钮
                    if (e.index == 1) {
                        var params = { ut: this.ut, orderCode: order.orderCode };
                        Vue.api.postForm(config.apiHost + "/api/my/order/confirmReceived", params, (result) => {
                            //更改订单为已完成
                            order.orderStatus = 8;

                        });
                        location.href = '/my/aftersale.html?orderCode='+this.orderCode;
                    }
                });
            }


        },
        //加入购物车
        addItemInCart: function (item) {
            var params = {ut:this.ut,mpId: item.mpId, num: 1, sessionId: this.sessionId};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
            });
        },
        // 如果是APP,跳APP详情页
        gotoDetail:function(mpId){
            "use strict";
            if(Vue.browser.isApp()){
                document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'
            }else{
                document.location.href='/detail.html?itemId='+mpId
            }
        },

        //再次购买
        againBuy: function (order) {
            var params = {
                ut: this.ut,
                orderCode: order.orderCode
            };
            Vue.api.get(config.apiHost + "/api/my/order/getOrderStockState", params, (res) => {
                this.showMoreBtn = false;
                if(!res.data || res.data.availableProductList.length == 0){
                    $.tips({
                        content:"没有可再次购买的有效商品！",
                        stayTime:2000,
                        type:"success"
                    });
                    return;
                }
                if(res.data && res.data.availableProductList.length > 0){
                    this.availableProductList = res.data.availableProductList;
                    this.diaShow = true;
                }
            });
        },
        addMyCar:function(){
            var temp = [];
            for(var i in this.availableProductList){
                temp.push({"mpId":this.availableProductList[i].mpId,"num":this.availableProductList[i].num});
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                sessionId: Vue.session.getSessionId(),
                skus: JSON.stringify(temp)
            };
            Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                //跳转购物车
                if(Vue.browser.isApp()) {
                    location.href = "${appSchema}://shoppingCart";
                    this.diaShow = false;
                } else {
                    location.href = '/cart.html';
                }
            })
        },
        noSave:function () {
            this.diaShow = false;
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
        prePayMent:function (order) {
            if(!order){
                return;
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                businessType:6,
                orderCode:order.orderCode,
                merchantId: order.childOrderList[0].orderProductList[0].merchantId,
                platformId: config.platformId,
            };
            var skus = {
                "mpId":order.childOrderList[0].orderProductList.mpId,
                "num":order.childOrderList[0].orderProductList.num,
                "isMain":0
                }
            params.skus = JSON.stringify([skus])
            Vue.utils.quickPurchase(params,null,false);
        },
        getNewOrderMessage:function (orderCode) {
            if(!orderCode){
                $.tips({
                    content:"暂无数据，请耐心等待",
                    stayTime:2000,
                    type:"warn"
                });
                return;
            }
            var params = {
                ut:Vue.auth.getUserToken(),
                orderCode: orderCode
            };
            Vue.api.postForm(this.msgUrl, params, (result) => {
                this.orderMsg=result.data;
            });
        }
    }//~ end methods

});
