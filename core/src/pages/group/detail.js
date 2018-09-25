import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiShare from"../../components/ui-share.vue";
import UiDialog from "../../components/ui-dialog.vue";
import UiSerialProduct from "../../components/ui-serial-product.vue";
import config from "../../../env/config.js";

let ut = Vue.auth.getUserToken();
let list = [];
let urlParams = Vue.utils.paramsFormat(location.search);
 
new Vue({
    el: 'body',
    components: { UiHeader,UiShare,UiSerialProduct,UiDialog,UiActionsheetPop},
    data: {
        patchGrouponId: urlParams.patchGrouponId,
        mpId: urlParams.mpId,
        groupInfo: {},
        product: {},
        shopList: [],
        totalCount: 0,
        nomore: false,
        pageNo: 1,
        pageSize: 10,
        shopInfoPrice: "",
        rightNavFlag: false,
        showShare: false,
        shareConfig: null,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        option: {},//弹出框配置
        showDialog: false, //显示弹出框
        itemInfo: {},
        isSeriesProduct: false,
        showSizePop: false,
        selectedSize: false,
        isKaituan: false,
        selectedItemInfo:'',
        popType:0,  //0:普通弹窗;3:开团
        noCheckDefault: true, //默认不选中任何商品属性
        currentPage:1,
        itemsPerPage:2,
        isFromBrand:urlParams.isFromBrand,
        isHeader:true,
        isIndex:true,
        listObj:[],//推荐列表
        itemAmount: 1,//已选商品数量
        countDown: {
            day: 0,
            hh: '00',
            mm:'00',
            ss:'00'
        },
        count: 0,
        isFavorite: 0,//收藏状态
        areaCode:'',//区code
        pintuanEntry:{},//拼团广告入口
        kanjiaEntry:{},//砍价广告入口
        serialAttributes:[],
        servicePro:[],
        showServicePop:false,//服务说明弹窗
    },
    ready: function() {
        this.getRecommendedList();
        this.getCartCount();
        this.getEntry();
        window.onpageshow = () => {
            this.getCartCount();
        }

        // this.getPatchGrouponInfoById();

        if (Vue.browser.isApp()){
            Vue.app.postMessage("getAreaCode", null, (res)=>{
                this.areaCode=res;
                this.getPatchGrouponInfoById();
            });
        } else{
            this.areaCode=Vue.area.getArea().aC;
            this.getPatchGrouponInfoById();
        }
 
    },
    computed:{
        selectedItemInfo:function(){
            "use strict";
            var arr = [];
            if (this.itemInfo.attres) {
                for(var k in this.itemInfo.attres){
                    arr.push(this.itemInfo.attres[k]);
                }
            }
            return this.noCheckDefault?'请选择商品规格':arr.join("，");
        }
    }, 
    methods: {
        goHome: function () {
            if(Vue.browser.isApp()) {
                location.href = '${appSchema}://home';
            }else {
                location.href = '/index.html';
            }
        },
        initGroupBuyOrder: function() {
            list[0].num = this.itemAmount;

            var url = config.apiHost + "/api/checkout/initGroupBuyOrder";
            var datacall = {
                ut: ut,
                merchantId: this.groupInfo.merchantId,
                platformId: config.platformId,
                grouponId: this.groupInfo.patchGrouponId,
                grouponCode: this.groupInfo.patchGrouponInstId,
                items: list
            };
            //Vue.loading.show();
            Vue.api.post(url, datacall, (res) => {
                //Vue.loading.hide();
                if(res.data && res.data.orderCode) {
                    this.option = {
                        title: '', //标题
                        content: '<div style="text-align:center">'+ res.data.message +'</div>', //内容
                        hasCancel: true,
                        btnOne: '查看订单', //按钮名字
                        clickOne: () => {
                            window.location.href = "/my/order-detail.html?orderCode=" + res.data.orderCode;
                        }
                    }
                    this.showDialog = true;
                }else {
                    window.location.href = "/pay/pay.html?type=1&t=1";
                }
            },(res) => {
                if(res.code){
                    if(res.code == '10200002'){
                        if(res.data && res.data.error){
                            $.tips({
                                content:res.data.error.message || '请稍后再试',
                                stayTime:2000,
                                type:"info",
                                callback:function(){
                                    if(res.data.error.type == 2){
                                        location.href = "/cart.html"
                                    }
                                }
                            })
                        }
                    }else{
                        $.tips({
                            content:res.message || '请稍后再试',
                            stayTime:2000,
                            type:"info"
                        });
                    }
                }
            });
        },
        updateProduct:function () {
            if(this.noCheckDefault){
                Vue.set(this.product,'grouponPrice',this.groupInfo.patchGrouponPrice);
                try {
                    Vue.set(this.product,'salePrice',this.groupInfo[0].salePrice);
                    Vue.set(this.product,'name',this.groupInfo[0].name);
                } catch (error) {
                }
            } else{
                Vue.set(this.product,'grouponPrice',this.itemInfo.promotionPrice);
                try {
                    Vue.set(this.product,'salePrice',this.itemInfo.price);
                    Vue.set(this.product,'name',this.itemInfo.name);
                } catch (error) {
                }
            }
        },
        getPatchGrouponInfoById: function() {
            if (this.patchGrouponId) {
                var url = config.apiHost + "/api/patchgroupon/getPatchGrouponInfoById";
                var datacall = {
                    patchGrouponId: this.patchGrouponId,
                    mpId: this.mpId
                };

                Vue.api.get(url, datacall, (res) => {
                    //倒计时
                    Vue.getSysTime((rtime) =>{
                        this.startCountDown((res.data.endTime-rtime.data.timestamp)/1000, this.countDown);
                    })
                    //多品 商品列表
                    if(res.data.grouponType) {
                        this.getProList();
                    }

                    this.groupInfo = res.data;

                    //单品
                    if(this.groupInfo.grouponType != 1) {
                        
                        if(this.groupInfo && this.groupInfo.productInfo && this.groupInfo.productInfo[0]) {
                            //取商品信息
                            this.product = this.groupInfo.productInfo[0];
                            //系列选择使用的信息
                            this.itemInfo={
                                price: this.product.salePrice,
                                promotionPrice: this.groupInfo.patchGrouponPrice,
                                name: this.product.name,
                                mpId: this.product.mpId,
                                pic: this.groupInfo.patchGrouponPicsUrl?this.groupInfo.patchGrouponPicsUrl[0]:'',
                                seriesId: this.product.seriesId,
                                activityId: this.groupInfo.patchGrouponId,
                                merchantId: this.product.merchantId
                            }
                            //初始化的商品信息
                            list.push({
                                merchantId: this.product.merchantId,
                                mpId: this.product.mpId,
                                num: 1
                            });

                            if(res.data.productInfo[0].seriesId) {
                                this.isSeriesProduct = true;
                            }
                            
                            this.shopInfoPrice = res.data.productInfo[0].salePrice;

                        }
                    }
                    
                    var appendImgText = res.data.descContent;
                    
                    Vue.nextTick(function() {
                        $("#append-img-text").html(appendImgText);
                        if(res.data.grouponType == 0) {
                            var bullets = document.getElementById("swipe-pos").getElementsByTagName("li");
                            var slider = Swipe(document.getElementById("swipe"), {
                                auto: 3e3,
                                continuous: !0,
                                callback: function(a) {
                                    for (var b = bullets.length; b--;) {
                                        bullets[b].className = " ";
                                        bullets[a].className = "on";
                                    }
                                }
                            })
                        }
                    });

                    //初始化微信分享信息
                    Vue.weixin.weixinShare({
                        link: location.href,
                        title: this.groupInfo.patchGrouponTitle,
                        desc: this.groupInfo.patchGrouponDesc || this.groupInfo.patchGrouponTitle,
                        imgUrl: this.groupInfo.patchGrouponPicsUrl[0]
                    });

                });
            }
        },

        //查询商品列表
        getProList: function () {
            var url = config.apiHost + '/api/patchgroupon/getPatchGrouponMpInfoList';
            var param = {
                platformId: config.platformId,
                currentPage: this.pageNo,
                itemsPerPage: this.pageSize,
                patchGrouponId: this.patchGrouponId,
                areaCode: this.areaCode,
                
                
            };
            Vue.api.get(url, param, (res) => {
                if(res.data.listObj) {
                    this.shopList = this.shopList.concat(res.data.listObj);    
                    this.totalCount = res.data.total;
                }
                if(this.totalCount <= this.pageSize || this.shopList.length >= this.totalCount) {
                    this.nomore = true;
                }
            }, () => {
            })
        },

        //点击加载更多
        clickLoadMore: function () {
            if (this.shopList.length < this.totalCount) {
                this.pageNo++;
                this.getProList();
            }
        },
        //点击分享
        clickShare: function () {
            // Vue.getSharePoint(this.patchGrouponId,3,2);
            var obj = {
                url: window.location.href,
                title: this.groupInfo.patchGrouponTitle || '',
                description: this.groupInfo.patchGrouponDesc || this.groupInfo.patchGrouponTitle,//不能为空，为空时，分享到qq空间，就会自动抓取网页内容
                pic: this.groupInfo.patchGrouponPicsUrl[0]
            }
            this.h5OrAppShare(obj);
        },
        //H5分享APP分享
        h5OrAppShare: function (data) {
            if(Vue.browser.isApp()) {
                Vue.app.postMessage('share',{
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    url160x160: data.pic,
                    pic: data.pic
                });
            }else {
                this.shareConfig = {
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    pic: data.pic
                };
                this.showShare = true;
            }
        },
        //显示选择
        showSizePanel: function (flag) {
            if(flag){
                this.popType=3;
            }else{
                this.popType=0;
            }
            this.isKaituan = flag;
            
            //if(this.selectedSize && this.isKaituan) {
            //    this.initGroupBuyOrder();
            //    return;
            //}
            this.showSizePop = true;
        },
        switchCut: function () {
            if(this.isSeriesProduct && this.noCheckDefault){
                // $.tips({
                //     content:"请先选择商品规格！",
                //     stayTime:2000,
                //     type:"success"
                // });
                this.showSizePop = true;
                return;
            }
            var obj = {
                merchantId: this.itemInfo.merchantId,
                mpId: this.itemInfo.mpId,
                num: this.itemAmount
            };
            list[0] = obj;
            this.patchGrouponId = this.itemInfo.activityId;
            this.mpId = this.itemInfo.mpId;
            $.extend(this.product, this.itemInfo);
            this.product.salePrice = this.itemInfo.originalPrice;
            this.product.grouponPrice = this.itemInfo.availablePrice;

            //console.log(this.itemInfo);

            // if(this.isKaituan) {// 5.27隐藏商品选择系列属性弹框，直接开团
                this.isKaituan = false;

                if(!Vue.auth.loggedIn()) {
                    if(Vue.browser.isApp()) {
                        document.location = '${appSchema}://login';
                    }else {
                        location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                    }
                    return;
                }
                this.initGroupBuyOrder();
            // }
            this.showSizePop = false;
            this.selectedSize = true;
        },
        //拼团推荐列表
        getRecommendedList:function () {
            var params = {
                patchGrouponId: this.patchGrouponId,
                currentPage: this.currentPage,
                itemsPerPage: this.itemsPerPage
            };
            Vue.api.get(config.apiHost + "/api/patchgroupon/recommend", params, (result) => {
                //获取当前服务器时间
                Vue.getSysTime((rtime) =>{
                    //遍历所有团购
                    for(var i in result.data.listObj) {
                        var expireTime = result.data.listObj[i].expireTime;
                       // var sysTime = result.data.listObj[i].sysTime;
                        //倒计时
                        this.startCountDown((expireTime -  rtime.data.timestamp) / 1000, result.data.listObj[i]);
                    }
                   // console.log(result);
                    this.listObj=result.data.listObj;
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
        //倒计时
        startCountDown: function (time, qg) {
            //第一次显示
            var hms = Vue.utils.getHhmmss(time);
            qg.hh = hms.h;
            qg.mm = hms.m;
            qg.ss = hms.s;
            qg.day = hms.d;

            var inter = setInterval(() => {
                time--;
                var hms = Vue.utils.getHhmmss(time);
                qg.hh = hms.h;
                qg.mm = hms.m;
                qg.ss = hms.s;
                qg.day = hms.d;
                if(time <= 0) {
                    clearInterval(inter);
                }
            }, 1000);
        },
        // 选择单个商品开团
        selectGroup: function (p) {
            if(!p.canAreaSold) {
                var dialog = $.dialog({
                    title: "温馨提示",
                    content: "该商品在该地区暂不支持销售<br>非常抱歉",
                    button: ["知道了"]
                });
                return;
            }
            if(p.seriesId) {
                this.isSeriesProduct = true;
            }else {
                this.isSeriesProduct = false;
            }
            
            this.itemInfo={};
            this.itemInfo.availablePrice = p.grouponPrice;
            this.itemInfo.name = p.name;
            this.itemInfo.mpId = p.mpId;
            this.itemInfo.pic = p.picUrl;
            this.itemInfo.seriesId = p.seriesId;
            this.itemInfo.merchantId = p.merchantId;
            this.itemInfo.activityId = this.patchGrouponId;
            
            this.showSizePanel(true);
        },
        //增减购物数量
        plusAmount: function (step) {
            if(this.isSeriesProduct && this.noCheckDefault){
                if($(".ui-poptips-cnt").length==0)
                    $.tips({
                        content:"请先选择商品规格！",
                        stayTime:2000,
                        type:"success"
                    });
                return;
            }

            var num = this.itemAmount + step;
            if (num>0 && num <= 999) {
                this.itemAmount = num;
            }
        },
        //跳转单品详情
        gotoGraphicDetail: function (p) {
            var url = '/group/graphic-details.html?patchGrouponId='+ this.patchGrouponId +'&mpId=' + p.mpId;
            if(!p.canAreaSold) {
                $.tips({
                    content:"该商品暂不在该区域销售",
                    stayTime:2000,
                    type:"success"
                });
            }else {
                location.href = url;
            }

        },
        //获取购物车数目
        getCartCount:function(){
            "use strict";
            //不用统一处理，防止99跳登录
            Vue.http.post('/api/cart/count', {
              ut: Vue.auth.getUserToken(),
              sessionId: Vue.session.getSessionId()
            }, {
              emulateJSON: true
            }).then((result) => {
              this.count=result.data.data;
            });
        },
        //跳转至购物车
        gotoCart: function () {
            if(Vue.browser.isApp()){
                document.location='${appSchema}://shoppingCar';
                //document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'
            }else{
                location.href = '/cart.html';
            }
        },
        //加入收藏夹
        addCollect: function (e) {
            e.stopPropagation();

            if(this.isFavorite ==0){
                // 未收藏
                this.addFavorite();
                this.isFavorite = 1;
            }else{
                // 已收藏
                this.deleteFavorite();
                this.isFavorite = 0;
            }

        },

        addFavorite : function(){
           var params = {
               ut:ut,
               entityId: this.product.mpId,
               companyId: this.companyId,
               type: 1
           };
           //以form提交而不是json格式
           Vue.api.postForm("/api/my/favorite/add", params, (result) => {
           });
       },
        deleteFavorite : function(){
            var params = {
                ut:ut,
                entityId: this.product.mpId,//商品id
                companyId: this.companyId,
                type: 1
            };
            //以form提交而不是json格式
            Vue.api.postForm("/api/my/favorite/clear", params, (result) => {
            });
        },
        getEntry:function(){
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: 'H5_COMMODITY_DETAILS_PAGE',
                adCode: 'pintuan_entry,kanjia_entry',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.pintuanEntry = res.data.pintuan_entry[0];
                this.kanjiaEntry = res.data.kanjia_entry[0];
            });
        }
    }
});
