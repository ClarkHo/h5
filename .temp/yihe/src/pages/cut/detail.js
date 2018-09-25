import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDialog from "../../components/ui-dialog.vue";
import UiShare from "../../components/ui-share.vue";
import UiSerialProduct from "../../components/ui-serial-product.vue";
import config from "../../../env/config.js";

var urlParams = Vue.utils.paramsFormat(location.href);

let state = Vue.utils.paramsFormat(location.href).state;

new Vue({
    el: 'body',
    components: { UiHeader,UiDialog,UiShare,UiSerialProduct },
    data: {
        ut: Vue.auth.getUserToken(),
        brandRecommendProduct: [],//商品推荐
        detail: {},             //砍价详情
        cutRecords: [],         //砍价记录
        progress: 0,            //进度
        limit: 5,               //砍价记录展示条数
        cutRule: '',            //砍价规则
        showDialog: false,      //显示弹出框
        showDialog2: false,      //显示弹出框
        option: {},             //弹出框配置
        cutCount: 0,            //已砍价次数
        canCutCount: 0,         //可砍价次数
        showShare: false,       //显示分享
        dialogContent: '',
        dialogPrice: '',
        shareConfig: {},
        isShare: urlParams.instId ? true:false,//分享进入
        canBuy: false,          //可下单
        cutOrderId: urlParams.instId,//砍价单ID
        canUseWeixin: false,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        productDesc: "",
        itemInfo: {},
        showSizePop: false,
        cutPriceMyself: true,
        failState:state,
        isChangeable:true,
        selectedItemInfo:'',
        popType:0,  //1:普通弹窗;2:立即购买;3请好友帮忙
        noCheckDefault:!Vue.utils.paramsFormat(window.location.href).ch,  //ch为1则表示已经选中
        btnMsg:"",
        itemBrandIds:'',//商品推荐
        mpId:'',//商品推荐,
        timestamp:0,//实时系统时间
        isFromBrand:urlParams.isFromBrand,
        isHeader:true,
        isIndex:true,
        repeatClick: false,
        refThemeId:''//砍价活动id 用于分享送伊豆
    },
    ready: function() {
       this.getKanjiaDetail();
       this.getCutRule();
       this.getIconInvisible();

       if(sessionStorage.share == '1') {
        this.showShare = true;
        sessionStorage.share = null;
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
                location.href = 'lyf:home';
            }else {
                location.href = '/index.html';
            }
        },
        //获取活动详情
        getKanjiaDetail: function (id) {
            var url = config.apiHost + '/api/promotion/cut/mpinfo';
            var params = {
                platformId: config.platformId,
                id: id||urlParams.id,
                instId: this.cutOrderId,
                ut: this.ut,
                nocache: new Date().getTime()
            };
            Vue.api.get(url, params, (res) => {
                if(res.data && res.data.obj) {
                    this.refThemeId = res.data.obj.refThemeId;
                    Vue.getSysTime((rtime) =>{
                        //倒计时
                        this.startCountDown(parseInt((res.data.obj.endTime-rtime.data.timestamp)/1000), res.data.obj);
                        this.timestamp=rtime.data.timestamp;
                        this.detail = res.data.obj;
                        // this.getPriceStockList(res.data.obj.mpId);
                        // 商品推荐
                        this.itemBrandIds = res.data.obj.brandId;
                        this.mpId = res.data.obj.mpId;
                        this.getBrandRecommendProduct();

                        //如果已生成砍价单
                        if(this.detail.inst) {
                            if(this.detail.inst.status ==3){
                                this.btnMsg = "订单已取消"
                            }
                            this.cutOrderId = this.detail.inst.id;
                            //如果inst有值代表这个单不能再改变
                            this.noCheckDefault=false;
                            this.isChangeable=false;
                        }
                        //如果没有系列属性
                        if(!this.detail.seriesId){
                            this.noCheckDefault=false;
                            this.isChangeable=false;
                        }

                        //进度计算
                        if(this.cutOrderId) {
                            this.progress = (res.data.obj.startPrice - res.data.obj.inst.currentPrice) / (res.data.obj.startPrice - res.data.obj.endPrice) * 100 || 0;
                            this.getCutRecords();
                        }
                        this.getProductDesc(this.detail.mpId);
                        this.canBuy = this.detail.isSelf && (this.detail.enableCreateCutPrice || this.detail.inst);
                        //系列选择使用的信息
                        this.itemInfo={
                            availablePrice: this.detail.startPrice,
                            name: this.detail.mpName,
                            mpId: this.detail.mpId,
                            pic: this.detail.mainPicture,
                            seriesId: this.detail.seriesId,
                            activityId: this.detail.id,
                            attres:this.detail.attributes
                        }

                        //砍价结束提示
                        if(this.detail.mpStock == 0) {
                            this.option = {
                                title: '', //标题
                                content: '哎呦~货卖完了！下次早点来吧', //内容
                                btnOne: '我知道了', //按钮名字
                                clickOne: () => {
                                    this.showDialog = false;
                                }
                            }
                            this.showDialog = true;
                        }

                        //初始化微信分享信息
                        Vue.weixin.weixinShare({
                            link: location.href,
                            title: '我要买【' + this.detail.mpName + '】',
                            desc: '快来帮我砍一刀',
                            imgUrl: this.detail.mainPicture
                        });
                    })

                }
            });
        },
        //商品描述（文描）
        getProductDesc: function (itemId) {
            var params = {
                mpId: itemId,
                platform: config.platformId
            };
            Vue.api.get(config.apiHost + "/api/product/desc", params, (result) => {
                if(result) {
                    result = result.replace(new RegExp(/<(style)(?:[^>]*)?>([\s\S]*?)(?:<\/\1>[^\"\']|<\/\1>$)/ig), '');
                }
                this.productDesc = result;
            });
        },
        //获取砍价记录
        getCutRecords: function () {
            var url = config.apiHost + '/api/promotion/cut/cutRecords';
            var params = {
                platformId: config.platformId,
                refInstId: this.cutOrderId,
                itemsPerPage: 99999,
                nocache: new Date().getTime()
            };
            Vue.api.get(url, params, (res) => {
                if(res.data && res.data.listObj) {
                    this.cutRecords = res.data.listObj;
                }
            });
        },
        //砍价
        cutPrice: function () {
            if(!this.checkUT()) {
                return;
            }
            if(this.repeatClick) {
                return;
            }
            this.repeatClick = true;
            var url = config.apiHost + '/api/promotion/cut/cutPrice';
            var params = {
                platformId: config.platformId,
                refInstId: this.cutOrderId,
                ut: this.ut
            };
            Vue.api.postForm(url, params, (res) => {
                this.getKanjiaDetail();
                this.repeatClick = false;
                this.cutPriceMyself = false;
                this.cutCount++;
                this.canCutCount = res.data.obj.remainCutTimes;

                this.dialogContent = '成功帮TA砍掉';
                this.dialogPrice = res.data.obj.cutDownPrice;


                this.showDialog2 = true;
            }, (res) => {
                this.repeatClick = false;
                var msg = '系统异常，请稍后再试';

                if(res.code) {
                    msg = res.message;

                    if(res.code == -1) {
                        this.option = {
                            title: '', //标题
                            content: msg , //内容
                            btnOne: '我知道了', //按钮名字
                            //btnTwo: '帮他分享',
                            clickOne: () => {
                                this.showDialog = false;
                            }/*,
                            clickTwo: () => {
                                this.showShare = true;
                                this.showDialog = false;
                            }*/
                        }
                        this.showDialog = true;
                        this.getKanjiaDetail();
                        return;
                    }
                }

                $.tips({
                    content: msg,
                    stayTime: 2000,
                    type: "warn"
                });
            });
        },
        //倒计时
        startCountDown: function (time, qg) {
            //第一次显示
            if(time > 0) {
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
                        if(this.detail.isValidMp)
                            location.reload();
                    }
                }, 1000);
            }else {
                qg.hh = '00';
                qg.mm = '00';
                qg.ss = '00';
                qg.day = '';
            }
                
        },
        //砍价规则
        getCutRule: function () {
            var url = config.apiHost + '/api/promotion/cut/rule';
            var params = {
                platformId: config.platformId
            };
            Vue.api.get(url, params, (res) => {
                this.cutRule = res.data.obj;
            });
        },
        //生成砍价单
        createInst: function (fn) {
            var url = config.apiHost + '/api/promotion/cut/createInst';
            var params = {
                ut: Vue.auth.getUserToken(),
                refMpId: this.itemInfo.activityId  //系列属性选择后的id
            };
            Vue.api.get(url, params, (res) => {
                this.cutOrderId = res.data.obj;
                this.getKanjiaDetail(this.itemInfo.activityId);
                if(typeof fn == 'function') {
                    fn(res.data.obj);
                }
            });
        },
        //检查是否能使用微信联合登录
        getIconInvisible: function() {
            Vue.api.get(config.ouserHost + "/ouser-web/unionLogin/iconInvisible.do", null, (result) => {
                if(result.data) {
                    this.canUseWeixin = result.data[2] == 1;    
                }
            });
        },
        //点击分享
        clickShare: function () {
            //如果可选属性且没有打开属性选择框,打开系列属性
            if(this.isChangeable&&!this.showSizePop){
                this.popSerial(3);
                return;
            }
            this.showSizePop=false;
            if(!this.checkUT()) {
                return;
            }

            var baseShareUrl = Vue.utils.getHost() + '/cut/detail.html?instId=';

            var obj = {
                url: baseShareUrl,
                title: '我要买【' + this.detail.mpName + '】',
                description: '快来帮我砍一刀',
                pic: this.detail.mainPicture
            }
            if(this.cutOrderId) {
                obj.url = baseShareUrl + this.cutOrderId;

                if(Vue.browser.weixin()) {
                    sessionStorage.share = '1';
                    location.href = baseShareUrl + this.cutOrderId;
                }else {
                    this.h5OrAppShare(obj);
                }
            }else {
                this.createInst((id) => {
                    obj.url = baseShareUrl + this.cutOrderId;

                    if(Vue.browser.weixin()) {
                        sessionStorage.share = '1';
                        location.href = baseShareUrl + this.cutOrderId;
                    }else {
                        this.h5OrAppShare(obj);
                    }
                });
            }
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
                /*document.location = '${appSchema}://share?body={'+
                    '"url":"'+ data.url +'",'+
                    '"title":"'+ data.title +'",'+
                    '"description":"'+ data.description +'",'+
                    '"pic":"'+ data.pic +'"}';*/
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
        //购买
        pay: function () {
            //如果可选属性且没有打开属性选择框,打开系列属性
            if(this.isChangeable&&!this.showSizePop){
                this.popSerial(2);
                return;
            }
            
            if(!this.checkUT()) {
                return;
            }
            if(this.cutOrderId) {
                location.href = "/pay/pay.html?id=" + this.cutOrderId + "&type=4";
            }else {
                this.createInst(function (id) {
                    location.href = "/pay/pay.html?id=" + id + "&type=4";
                });
            }
            
        },
        //判断是否登录
        checkUT: function () {
            if(!this.ut) {
                // 产品和后端确认，砍价不应该走联合登录 GUIDE-10418【宜和online】砍价邀请好友跳转错误：错调了联合登录导致跳转到公众号的页面了
                /* if(Vue.browser.weixin() && this.canUseWeixin) {
                    var url = config.ouserHost + '/ouser-web/unionLogin/getRelatedParams.do';
                    var redirectUrl = "/unionlogin.html";
                    var params = {
                        gateway: 2,
                        redirectUrl: redirectUrl
                    };
                    Vue.api.post(url, params, (res) => {
                        location.href = res.data;
                    });
                }else {
                    if(Vue.browser.isApp()) {
                        document.location = '${appSchema}://login';
                    }else {
                        location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                    }
                } */
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
        //弹出系列属性窗口
        popSerial:function(type){
            "use strict";
            this.popType=type;
            this.showSizePop=true;
        },
        //切换商品详情页
        switchCut: function () {
            if(this.itemInfo.activityId) {
                if(this.noCheckDefault)
                    location.href = '/cut/detail.html?id=' + this.itemInfo.activityId;
                else
                    location.href = '/cut/detail.html?id=' + this.itemInfo.activityId+'&ch=1';
            }
        },
        //系列属性确定操作
        submitSerial:function(){
            "use strict";
            //如果不选属性,提示用户先选择属性
            if(this.noCheckDefault) {
                //this.showSizePop=false;
                if($('.ui-poptips').length==0)
                    $.tips({
                        content: '请选择商品规格!',
                        stayTime: 2000,
                        type: "warn"
                    });
            }
            //如果已经选好属性
            else{
                //如果是纯粹弹窗选择属性,切换商品详情页
                if(this.popType==1){
                    //this.showSizePop=false;
                    //切换砍价商品
                    this.switchCut();
                    //return;
                }
                //如果是立即购买
                else if(this.popType==2){
                    //立即购买
                    this.pay();
                }else if(this.popType==3){
                    //this.showSizePop=false;
                    //请好友帮忙
                    this.clickShare();
                    //alert()
                }
            }
        },
        //商品推荐
        getBrandRecommendProduct:function () {
            var params = {
                companyId: Vue.mallSettings.getCompanyId(),
                //ut: Vue.auth.getUserToken(),
                pageSize: 12,
                brandId:this.itemBrandIds,
                mpId:this.mpId
            };
            Vue.api.get(config.apiHost + "/api/search/brandRecommendProduct", params, (result) => {
                this.brandRecommendProduct = result.data.productList;
            }, () => {
                //处理掉不显示报错
            });
        },
        //去逛逛
        goHome: function () {
            if(Vue.browser.isApp()) {
                location.href = '${appSchema}://home';
            }else {
                location.href = '/index.html';
            }
        }
    }
});