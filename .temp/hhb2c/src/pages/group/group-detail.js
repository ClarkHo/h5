import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiShare from "../../components/ui-share.vue";
import UiSerialProduct from "../../components/ui-serial-product.vue";
import UiDialog from "../../components/ui-dialog.vue";
import UiGuessLike from "../../components/ui-guess-like.vue";
import config from "../../../env/config.js";
//需要依次判断团身份、团状态、是否从支付成功返回()


var urlParams = Vue.utils.paramsFormat(location.search);
var payBack = urlParams.payBack;
//支付返回payback的值为grouponId
var patchGrouponInstId = payBack || urlParams.instId;
//user token
var ut = Vue.auth.getUserToken();

//重写支付返回的url
if (payBack) {
    window.history.replaceState(null, "", location.pathname + "?instId=" + payBack);
}

new Vue({
    el: 'body',
    components: {
        UiHeader, UiShare, UiSerialProduct, UiDialog, UiGuessLike
    },
    data: {
        detail: {}, //详情信息
        product: {},
        patchGrouponId: '',//活动ID
        groupFailed: false, //团单状态
        member: [],
        time: {day: '', hour: '', minute: '', second: ''},
        shopList: [],
        totalCount: 0,
        nomore: false,
        pageNo: 1,
        pageSize: 10,
        showShare: false,
        //是否可以加入团
        groupCanJoin: false,
        //当前用户是否已经加入该团
        hasJoinGroup: false,
        shareConfig: null,
        isApp: Vue.browser.isApp(),
        weixin: Vue.browser.weixin(),
        isSeriesProduct: false,
        itemInfo: {},
        showSizePop: false,
        isCantuan: true,
        option: {},//弹出框配置
        showDialog: false, //显示弹出框
        countDown: {
            day: 0,
            hh: '00',
            mm:'00',
            ss:'00'
        },
        noCheckDefault: true,
        itemAmount: 1,//已选商品数量
        recoList: [],
        pintuanEntry:{},//拼团cms页
        kanjiaEntry:{}//砍价cms页
    },
    //初始化
    ready: function () {
        this.getGroupDetail();
        this.getEntry();
    },
    methods: {
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
        },
        backEvent: function () {
            if (urlParams.refer == "pay") {
                location.replace(this.pintuanEntry.linkUrl);
            }else if(Vue.browser.isApp()){
                Vue.app.back();
            }else if(document.referrer != "") {
                history.back();
            }else {
                location.replace(this.pintuanEntry.linkUrl);
            }
        },
        //我的团详情
        getGroupDetail: function () {
            var params = {
                ut: ut,
                instanceId: patchGrouponInstId
            };

            Vue.api.get("/api/patchgroupon/getGrouponInstanceInfoById", params, (res) => {

                //获取当前服务器时间
                Vue.getSysTime((rtime) => {
                    this.startCountDown((res.data.patchGrouponEndTime - rtime.data.timestamp) / 1000, this.countDown);
                });
                if(res.data.grouponType) {
                    this.patchGrouponId = res.data.patchGrouponId;
                    this.getProList();
                }
                this.detail = res.data;
                this.product = this.detail.currentProductInfo;
                this.getRecoList(this.product.mpId);
                this.getPatchGrouponInfoById(this.product.mpId,this.detail.patchGrouponId)

                this.groupCanJoin = this.detail.status == 0 || this.detail.status == 1 || this.detail.status == 2;
                this.hasJoinGroup = this.detail.isCatptain || this.detail.isMember;

                //0-初始状态；1:已开团；2：组团中；3：已成团   剩下是失败
                if (res.data.status != 0 && res.data.status != 1 && res.data.status != 2 && res.data.status != 3) {
                    this.groupFailed = true; //失败
                }

                if(this.product.seriesId) {
                    this.isSeriesProduct = true;
                }

                //系列选择使用的信息
                this.itemInfo = {
                    availablePrice: this.product.grouponPrice,
                    name: this.product.name,
                    mpId: this.detail.virMpId,//虚品Id
                    pic: this.detail.singleVirMpPic,//虚品图片
                    seriesId: this.product.seriesId,
                    activityId: this.detail.patchGrouponId,
                    merchantId: this.product.merchantId
                }

                for (var i = 0; i < res.data.totalMembers; i++) {
                    this.member.push('0');
                }

                //分享
                if (payBack && this.detail.status != 3) {
                    setTimeout(() => {
                        this.clickShare();
                    }, 1000);
                }

                //初始化微信分享信息
                var obj = {
                    link: location.href,
                    title: '',
                    desc: '',
                    imgUrl: this.detail.patchGrouponMainPicUrl
                };
                if (this.product) {
                    obj.title = '我买了“' + this.product.grouponPrice + '元【' + this.product.name + '】';
                }
                if (this.detail.attendeeList) {
                    obj.desc = '还差' + (this.detail.totalMembers - this.detail.attendeeList.length) + '人 ' + (this.detail.patchGrouponDesc || '');
                }
                Vue.weixin.weixinShare(obj);
            });
        },
        //查询商品列表
        getProList: function () {
            var url = config.apiHost + '/api/patchgroupon/getPatchGrouponMpInfoList';
            var param = {
                platformId: config.platformId,
                currentPage: this.pageNo,
                itemsPerPage: this.pageSize,
                patchGrouponId: this.patchGrouponId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                for(var i in res.data.listObj) {
                    var obj = res.data.listObj[i];
                    if(!obj.canAreaSold) {
                        obj.disabled = true;
                    }
                }
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
                if (time <= 0) {
                    clearInterval(inter);
                }
            }, 1000);
        },
        //倒计时
        showCountDown: function (endTime) {
            var now = new Date();
            var endDate = new Date(endTime);
            var leftTime = endDate.getTime() - now.getTime();
            if (leftTime > 0) {
                var leftSecond = parseInt(leftTime / 1000);
                this.time.day = Math.floor(leftSecond / (60 * 60 * 24));
                this.time.hour = Math.floor((leftSecond - this.time.day * 24 * 60 * 60) / 3600);
                this.time.minute = Math.floor((leftSecond - this.time.day * 24 * 60 * 60 - this.time.hour * 3600) / 60);
                this.time.second = Math.floor(leftSecond - this.time.day * 24 * 60 * 60 - this.time.hour * 3600 - this.time.minute * 60);
                if (this.time.hour < 10) {
                    this.time.hour = '0' + this.time.hour;
                }
                if (this.time.minute < 10) {
                    this.time.minute = '0' + this.time.minute;
                }
                if (this.time.second < 10) {
                    this.time.second = '0' + this.time.second;
                }
            } else if (leftTime == 0) {
                this.getGroupDetail();
            }
        },

        //参团
        joinGroup: function (p) {
            this.isCantuan = true;
            // this.showSizePop = true;
            this.switchCut();
        },

        // 开团
        createGroup: function (p) {
            this.isCantuan = false;
            // this.showSizePop = true;
            this.switchCut();
        },
        // 选择单个商品开团
        selectGroup: function (p, flag) {
            if(!p.canAreaSold) {//该区域不可售
                return;
            }

            this.itemInfo={};
            this.itemInfo.availablePrice = p.grouponPrice;
            this.itemInfo.name = p.name;
            this.itemInfo.mpId = p.mpId;
            this.itemInfo.pic = p.picUrl;
            this.itemInfo.seriesId = p.seriesId;
            this.itemInfo.merchantId = p.merchantId;
            this.itemInfo.activityId = this.patchGrouponId;

            if(p.seriesId) {
                this.isSeriesProduct = true;
            }else {
                this.isSeriesProduct = false;
            }

            if(flag) {
                this.createGroup(p);
            }else {
                this.joinGroup(p);
            }
        },
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
        //初始化订单
        initGroupBuyOrder: function (joinGroup, productInfo) {
            if(!this.checkUT()) {//检查登录
                return;
            }

            var url = config.apiHost + "/api/checkout/initGroupBuyOrder";
            
            var proList = [];
            proList.push({
                merchantId: productInfo[0].num,
                mpId: productInfo[0].mpId,
                num: this.itemAmount
            });

            var params = {
                ut: ut,
                merchantId: productInfo[0].merchantId,
                platformId: config.platformId,
                grouponId: this.detail.patchGrouponId,
                items: proList
            };

            if (joinGroup) {
                params.grouponCode = patchGrouponInstId;
            }

            Vue.api.post(url, params, (res) => {

                if (res.data && res.data.orderCode) {
                    this.option = {
                        title: '', //标题
                        content: '<div style="text-align:center">' + res.data.message + '</div>', //内容
                        hasCancel: true,
                        btnOne: '查看订单', //按钮名字
                        clickOne: () => {
                            window.location.href = "/my/order-detail.html?orderCode=" + res.data.orderCode;
                        }
                    }
                    this.showDialog = true;
                } else {
                    window.location.href = "/pay/pay.html?type=1&t=1";
                }
            });
        },

        //点击分享
        clickShare: function () {
            var obj = {
                url: location.href,
                title: '',
                description: '',
                pic: this.detail.patchGrouponMainPicUrl
            };
            if (this.product) {
                obj.title = '我买了“' + this.product.grouponPrice + '元【' + this.product.name + '】';
            }
            if (this.detail.attendeeList) {
                obj.description = '还差' + (this.detail.totalMembers - this.detail.attendeeList.length) + '人 ' + (this.detail.patchGrouponDesc || '');
            }
            this.h5OrAppShare(obj);
        },
        //H5分享APP分享
        h5OrAppShare: function (data) {
            if (Vue.browser.isApp()) {
                Vue.app.postMessage('share',{
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    url160x160: data.pic,
                    pic: data.pic
                });
            } else {
                this.shareConfig = {
                    url: data.url,
                    title: data.title,
                    description: data.description,
                    pic: data.pic
                };
                this.showShare = true;
            }
        },
        //点击我要开团,选择系列品后
        switchCut: function () {
            if(this.isSeriesProduct && this.noCheckDefault){
                $.tips({
                    content:"请先选择商品规格！",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop = true;
                return;
            }
            
            var productInfo = [];
            productInfo.push(this.itemInfo);
            this.initGroupBuyOrder(this.isCantuan, productInfo);
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
            if (num>0 && num <= 99) {
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
                return;
            }
            location.href = url;
        },
        //猜你喜欢
        getRecoList: function (mpIds) {
            this.recoList = [];
            var url = config.apiHost + '/api/read/product/recommendProductList';
            var param = {
                sceneNo: 1,//推荐商品场景，0,首页;1,详情页;2,购物车;3,订单页;4,搜索页无搜索结果
                ut: Vue.auth.getUserToken(),
                mpIds: mpIds,
                pageSize: 20,
                pageNo: 1,
                platformId: config.platformId,
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
                    Vue.getPriceAndStock(itemIds,res.data.dataList,null,(obj)=>{
                        var list = [];
                        var temp = [];
                        for(var i in obj) {
                            if(i % 4 == 0) {
                                temp = [];
                            }
                            temp.push(obj[i]);
                            if(i % 4 == 0) {
                                list.push(temp);
                            }
                        }
                        this.recoList = list;
                        this.resizeImgHeight();
                        this.initSwipe();
                    });
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.ui-grid-halve-img img').width();
                $('.ui-grid-halve-img img').height(width);
            })
        },
        //轮播初始化
        initSwipe: function () {
            Vue.nextTick(function () {
                $('.swipe').each(function () {
                    var points = $(this).find('.swipe-point li');
                    Swipe(this, {
                        //auto: 3000,
                        continuous: true,
                        disableScroll: false,
                        callback: function (i, ele) {
                            points.removeClass('active').eq(i).addClass('active');
                        }
                    });
                });

            })
        },
        // 如果是APP,跳APP详情页
        gotoDetail:function(mpId){
            if(Vue.browser.isApp()){
                document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'
            }else{
                document.location.href='/detail.html?itemId='+mpId;
            }
        },
        //获取商品详情
        getPatchGrouponInfoById: function(mpId,patchGrouponId) {
            if (patchGrouponId) {
                var url = config.apiHost + "/api/patchgroupon/getPatchGrouponInfoById";
                var datacall = {
                    patchGrouponId: patchGrouponId,
                    mpId: mpId
                };

                Vue.api.get(url, datacall, (res) => {
                    var appendImgText = res.data.descContent;

                    Vue.nextTick(function() {
                        $("#append-img-text").html(appendImgText);
                    });

                });
            }
        },
    }
});