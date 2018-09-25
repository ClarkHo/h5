import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDialog from "../../components/ui-dialog.vue";
import UiSerialProduct from "../../components/ui-serial-product.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(location.search);
let list = [];

new Vue({
    el: 'body',
    components: { UiHeader,UiDialog,UiSerialProduct},
    data: {
        patchGrouponId: urlParams.patchGrouponId,
        mpId: urlParams.mpId,
        shopInfo: {},
        shopInfoPrice: "",
        rightNavFlag: false,
        showShare: false,
        shareConfig: null,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        option: {},//弹出框配置
        showDialog: false, //显示弹出框
        isSeriesProduct: false,
        itemInfo: {},
        showSizePop: false,
        selectedSize: false,
        isKaituan: false,
        selectedItemInfo:'',
        popType:0,  //0:普通弹窗;3:开团
        noCheckDefault: true, //默认不选中任何商品属性
        currentPage:1,
        itemsPerPage:2,
        itemAmount: 1//已选商品数量
    },
    ready: function() {
        this.getPatchGrouponInfoById();
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
        //判断是否登录
        checkUT: function () {
            if(!Vue.auth.getUserToken()) {
                if(Vue.browser.isApp()) {
                    document.location = '${appSchema}://login';
                }else {
                    location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                }
                return false;
            }else {
                return true;
            }
        },
        initGroupBuyOrder: function() {
            if(!this.checkUT()) {//检查登录
                return;
            }
	       list[0].num = this.itemAmount;
	    
            var url = config.apiHost + "/api/checkout/initGroupBuyOrder";
            var datacall = {
                ut: Vue.auth.getUserToken(),
                merchantId: this.shopInfo.merchantId,
                platformId: config.platformId,
                grouponId: this.shopInfo.patchGrouponId,
                grouponCode: this.shopInfo.patchGrouponInstId,
                items: list
            };
            Vue.api.post(url, datacall, (res) => {
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
                    window.location.href = "/pay/pay.html";
                }
            });
        },
        getPatchGrouponInfoById: function() {
            if (this.patchGrouponId) {
                var url = config.apiHost + "/api/patchgroupon/getPatchGrouponInfoById";
                var datacall = {
                    patchGrouponId: this.patchGrouponId,
                    mpId: this.mpId
                };

                Vue.api.get(url, datacall, (res) => {
                    this.shopInfo = res.data;
                    //系列选择使用的信息
                    this.itemInfo={
                        availablePrice: this.shopInfo.patchGrouponPrice,
                        name: this.shopInfo.productInfo[0].name,
                        mpId: this.shopInfo.productInfo[0].mpId,
                        pic: this.shopInfo.productInfo[0].picUrl,
                        seriesId: this.shopInfo.productInfo[0].seriesId,
                        activityId: this.shopInfo.patchGrouponId,
                        merchantId: this.shopInfo.productInfo[0].merchantId
                    }
                    if(res.data && res.data.productInfo && res.data.productInfo[0]) {
                        //取商品信息
                        list.push({
                            merchantId: res.data.productInfo[0].merchantId,
                            mpId: res.data.productInfo[0].mpId,
                            num: 1
                        });

                        if(res.data.productInfo[0].seriesId) {
                            this.isSeriesProduct = true;
                        }
                        
                        this.shopInfoPrice = res.data.productInfo[0].salePrice;
                    }

                    var appendImgText = res.data.descContent;
                    $("#append-img-text").html(appendImgText);

                    //初始化微信分享信息
                    Vue.weixin.weixinShare({
                        link: location.href,
                        title: this.shopInfo.patchGrouponTitle,
                        desc: this.shopInfo.patchGrouponDesc || this.shopInfo.patchGrouponTitle,
                        imgUrl: this.shopInfo.patchGrouponPicsUrl[0]
                    });
                });
            }
        },
        //点击分享
        clickShare: function () {
            var obj = {
                url: window.location.href,
                title: this.shopInfo.patchGrouponTitle || '',
                description: this.shopInfo.patchGrouponDesc || this.shopInfo.patchGrouponTitle,//不能为空，为空时，分享到qq空间，就会自动抓取网页内容
                pic: this.shopInfo.patchGrouponPicsUrl[0]
            }
            this.h5OrAppShare(obj);
        },
        //H5分享APP分享
        h5OrAppShare: function (data) {
            if(Vue.browser.isApp()) {
                document.location = '${appSchema}://share?body={'+
                    '"url":"'+ data.url +'",'+
                    '"title":"'+ data.title +'",'+
                    '"description":"'+ data.description +'",'+
                    '"pic":"'+ data.pic +'"}';
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
                $.tips({
                    content:"请选择颜色和尺码",
                    stayTime:2000,
                    type:"success"
                });
                return;
            }
            var obj = {
                merchantId: this.itemInfo.merchantId,
                mpId: this.itemInfo.mpId,
                num: this.itemInfo.num || 1
            };
            list[0] = obj;
            this.patchGrouponId = this.itemInfo.activityId;
            this.mpId = this.itemInfo.mpId;
            this.getPatchGrouponInfoById();
            if(this.isKaituan) {
                this.isKaituan = false;
                /*if(this.noCheckDefault) {
                    $.tips({
                        content: '请选择商品颜色与尺码',
                        stayTime: 2000,
                        type: "warn"
                    });
                    return;
                }*/

                if(!Vue.auth.loggedIn()) {
                    if(Vue.browser.isApp()) {
                        document.location = '${appSchema}://login';
                    }else {
                        location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                    }
                    return;
                }
                this.initGroupBuyOrder();
            }
            this.showSizePop = false;
            this.selectedSize = true;
        },
        // 如果是APP,跳APP详情页
        gotoDetail:function(mpId) {
            "use strict";
            if(Vue.browser.isApp()){
                document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'
            }else{
                document.location.href='/detail.html?itemId='+mpId
            }
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
        }

    }
});

