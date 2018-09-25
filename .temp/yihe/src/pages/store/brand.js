import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";
import UiShare from "../../components/ui-share.vue";
import VueLazyload from 'vue-lazyload';

//隐藏app头部
Vue.app.postMessage('hiddenHead', {
    'isHidden': '1'
});

Vue.use(VueLazyload, {
    loading: config.defaultImg
});

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiShare
    },
    data: {
        isWeixin: Vue.browser.weixin(),
        companyId: Vue.mallSettings.getCompanyId(),

        displayStyle: false, // false方块显示，true条纹显示

        tabState: 0, // csm调入默认tab状态

        brandIds: '', // 品牌id
        brandLogo: [], // 品牌logo
        brandName: [], // 品牌name

        isEnd: false, //滚动到底
        noData: false, //没有数据

        searchListItem: [], // 搜索列表
        allProductList: [], // 商品列表
        promotionType: '', // 品牌活动类型
        brandPromotionListItem: [], // 品牌活动
        brandHotListItem: [], // 热销列表
        brandActionSearch: 0, // 品牌活动搜索

        sortType: 10,
        filterType: '',

        pageNo: 1, //页数
        pageSize: 10, //每页个数

        navActive: 0, //nav导航active
        searchActive: 0, //search导航active
        priceState: false, //默认从高到低
        priceStateBox: false, //价格弹层

        promotionTypeNameAll: false,

        pageUrl: '', //跳转链接
        isIndex: true, //是否有首页
        isBrandPage: 0, //从band页逆向到midPage页

        showShare: false, //显示分享
        shareConfig: null, //分享配置
        showMark: false, //是否显示角标

    },
    ready: function() {
        this.brandIds = urlParams.brandIds;
        this.tabState = urlParams.tabState;

        //初始化PageRestorer (1分钟)
        Vue.pageRestorer.init(this, "brand", 1000 * 60);
        //restore页面的内容
        if (Vue.pageRestorer.restore()) {
            //alert(123);
        } else {
            // 获取logo
            this.getLogo();
            // 获取是否有cmsUrl
            this.cmsUrl();
        }
        this.showLabel();
        //滚动加载更多数据
        Vue.scrollLoading(() => {

            if ((this.navActive == 1 || this.navActive == 3) && !this.isEnd) {
                this.pageNo += 1;
                this.searchList();
            }
            if (this.navActive == 2 && !this.isEnd) {
                this.pageNo += 1;
                this.brandHotList();
            }
            if (this.navActive == 4 && !this.isEnd) {
                this.pageNo += 1;
                if (this.brandActionSearch == 0) {
                    this.brandPromotionList(1012);
                }
                if (this.brandActionSearch == 1) {
                    this.brandPromotionList(3001);
                }
                if (this.brandActionSearch == 2) {
                    this.brandPromotionList(2001);
                }

            }

        });
    },
    methods: {
        //以下方法用于临时方案，图片增加角标,
        //获取客户端指定时间的date对象
        getClientDate: function(month, day, hours, minutes, seconds) {
            var d = new Date();
            d.setMonth(month - 1, 1);
            d.setDate(day || 0);
            d.setHours(hours || 0);
            d.setMinutes(minutes || 0);
            d.setSeconds(seconds || 0);
            d.setMilliseconds(0);
            return d;
        },



        showLabel: function() {
            Vue.getSysTime((rtime) => {
                var currentTime = this.sysTime = rtime.data.timestamp || new Date().getTime(); //防止服务器返回错误数据
                //获取6/5,6/8的timestamp
                var startTime = this.getClientDate(6, 5).getTime();
                var endTime = this.getClientDate(6, 8).getTime();
                //系统当前时间是在[6/5,6/8)之间
                this.showMark = currentTime >= startTime && currentTime < endTime;

            });
        },
        //记住页签
        rememberTab: function(index) {
            var params = Vue.utils.paramsFormat(location.href);
            var hashParams = Vue.utils.convertToString(Vue.utils.hashFormat(location.href));
            params.tabState = index;
            var url = location.pathname + '?' + Vue.utils.convertToString(params) + (hashParams ? '#' + hashParams : '');
            window.history.replaceState(null, "", url);
            Vue.weixin.initWeixinShare();
        },
        init: function() {
            if (this.navActive == 0) {
                // this.cmsUrl();
            };
            if (this.navActive == 1) {
                this.searchActive = 0;
                this.recommend();
            };
            if (this.navActive == 2) {
                this.pageNo = 1;
                this.isEnd = false;
                this.noData = false;
                this.brandHotListItem = [];
                this.brandHotList();
            };
            if (this.navActive == 3) {
                this.newList();
            };
            if (this.navActive == 4) {
                this.pageNo = 1;
                this.isEnd = false;
                this.noData = false;
                this.brandPromotionListItem = [];
                this.brandPromotionList(1021);
                this.brandActionSearch = 0
            };

        },
        // 判断是否跳CMS
        cmsUrl: function() {
            var url = config.apiHost + '/cms/brand/checkBrandPage';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                brandId: this.brandIds
            };
            Vue.api.get(url, param, (res) => {
                // this.pageUrl = res.data.pageUrl;
                // window.location.href = this.pageUrl;

                // 如果CMS未配置首页，不显示首页tab
                if (!res.data) {
                    this.isIndex = false;
                    this.navActive = 1;
                }
                if (urlParams.tabState) {
                    this.navActive = this.tabState;
                }
                this.init();

            }, (res) => {
                this.isIndex = false;
                if (urlParams.tabState) {
                    this.navActive = this.tabState;
                } else {
                    this.navActive = 1;
                }
                this.init();
            })
        },
        // 获取logo保留
        getLogo: function() {
            var url = config.apiHost + '/api/search/searchList';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                brandIds: this.brandIds,
                sortType: this.sortType,
                filterType: this.filterType,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
            };
            Vue.api.get(url, param, (res) => {
                // this.brandLogo = res.data.brandResult;
                this.brandLogo = res.data.brandResult[0].logo;
                this.brandName = res.data.brandResult[0].name;

                //如果用户已登录就查询分享信息
                if (Vue.auth.loggedIn()) {
                    this.getShareInfo(Vue.weixin.weixinShare);
                } else {
                    this.registerShareInfo();
                }

            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        // 搜索 多处公用
        searchList: function() {
            var url = config.apiHost + '/api/search/searchList';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                brandIds: this.brandIds,
                sortType: this.sortType,
                filterType: this.filterType,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
            };
            Vue.api.get(url, param, (res) => {
                this.searchListItem = res.data;
                if (res.data && res.data.productList) {
                    if (res.data.productList.length > 0) {
                        this.allProductList = this.allProductList.concat(res.data.productList);
                    } else if (this.allProductList.length !== 0) {
                        this.isEnd = true;
                    }
                }

                if (this.allProductList.length == 0) {
                    this.noData = true;
                };
                this.resizeImgHeight();

            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //统计所有促销标签
        formatPromotionText: function(prod) {
            "use strict";
            var iconText = [];
            if (prod.promotionInfo instanceof Array && prod.promotionInfo.length > 0) {
                if (prod.promotionInfo[0].promotions instanceof Array && prod.promotionInfo[0].promotions.length > 0) {
                    prod.promotionInfo[0].promotions.forEach((v) => {
                        iconText.push(v.iconText);
                    })
                }
            };
            return (prod.promotionIconTexts || []).concat(iconText);
        },
        // 推荐 
        recommend: function() {
            this.brandActionSearch = 99; //重置brandActionSearch 防止点完活动商品再点正常商品
            this.sortType = 10; //综合
            this.reset();
        },
        // 销量从高到低
        sortSale: function() {
            this.sortType = 15; //销量从高到低
            this.reset();
        },
        //价格排序
        sortPrice: function() {
            this.searchActive = 3;
            if (this.priceState) {
                this.sortType = 14;
            } else {
                this.sortType = 13;
            }
            this.priceState = !this.priceState;
            this.reset();
        },
        // 价格从高到底
        sortPriceDESC: function() {
            this.sortType = 14; //价格从高到底
            this.reset();
        },
        // 价格从底到高
        sortPriceASC: function() {
            this.sortType = 13; //价格从底到高
            this.reset();
        },
        // 新品
        newGoods: function() {
            this.sortType = 12; //最新发布
            this.reset();
        },
        // 所有商品
        allList: function() {
            this.allProductList = [];
            this.reset();
        },
        // 上新
        newList: function() {
            this.brandActionSearch = 99; //重置brandActionSearch 防止点完活动商品再点正常商品
            this.allProductList = [];
            this.pageNo = 1;
            this.isEnd = false;
            this.noData = false;

            this.sortType = 12;
            this.filterType = 'IS_NEW';

            $('.good-box').css({
                marginTop: '84px'
            })
            this.searchList();
        },
        // 查询重置
        reset: function() {
            this.allProductList = [];
            this.pageNo = 1;
            this.filterType = '';
            this.isEnd = false;
            this.noData = false;
            this.searchList();
            $('.good-box').css({
                marginTop: '127px'
            })
        },
        rest: function() {

        },
        // 品牌活动
        brandPromotionList: function(type) {
            var url = config.apiHost + '/api/search/brandPromotionList';
            var param = {
                brandId: this.brandIds,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                promotionType: type
            };
            Vue.api.get(url, param, (res) => {
                this.promotionType = res.data.promotionType;
                if (res.data && res.data.productList) {
                    if (res.data.productList.length > 0) {
                        this.brandPromotionListItem = this.brandPromotionListItem.concat(res.data.productList);
                    } else if (this.brandPromotionListItem.length !== 0) {
                        this.isEnd = true;
                    }
                }

                if (this.brandPromotionListItem.length == 0) {
                    this.noData = true;
                };
                this.resizeImgHeight();

            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        // 热销
        brandHotList: function() {
            var url = config.apiHost + '/api/product/brandHotList';
            var param = {
                platformId: config.platformId,
                brandId: this.brandIds,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get(url, param, (res) => {
                if (res.data && res.data.data) {
                    if (res.data.data.length > 0) {
                        this.brandHotListItem = this.brandHotListItem.concat(res.data.data);
                    } else if (this.brandHotListItem.length !== 0) {
                        this.isEnd = true;
                    }
                }

                if (this.brandHotListItem.length == 0) {
                    this.noData = true;
                };
                this.resizeImgHeight();
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        // 如果是APP,跳APP详情页
        gotoDetail: function(mpId, patchGrouponId) {
            "use strict";
            if (this.brandActionSearch == 0) {
                // 秒杀
                document.location.href = '/detail.html?itemId=' + mpId + '&isFromBrand=true';
            } else if (this.brandActionSearch == 1) {
                // 砍价
                document.location.href = '/cut/detail.html?id=' + patchGrouponId + '&isFromBrand=true';
            } else if (this.brandActionSearch == 2) {
                // 拼团
                document.location.href = '/group/detail.html?patchGrouponId=' + patchGrouponId + '&mpId=' + mpId + '&isFromBrand=true';
            } else {
                if (Vue.browser.isApp()) {
                    document.location = 'ds://productdetail?body={"mpId":' + mpId + '}'
                } else {
                    document.location.href = '/detail.html?itemId=' + mpId;
                }

            }
        },
        goBackToApp: function() {
            if (Vue.browser.isApp()) {
                Vue.app.postMessage('webViewBack');
            } else {
                history.back();
            }
        },
        goBackToBandMidPage: function() {
            document.location.href = '/brand/brand-midPage.html?brandIds=' + this.brandIds + '&isBrandPage=' + this.isBrandPage;
        },
        //点击分享
        clickShare: function() {
            if (!Vue.auth.loggedIn()) { //如果没有登录 需要先登录 为了获取自家did
                if (Vue.browser.isApp()) {
                    location.href = 'ds://login';
                } else {
                    location.href = '/login.html?from=' + encodeURIComponent(Vue.utils.getRelatedUrl());
                }
                return;
            }
            if (Vue.browser.isApp()) {
                document.location = 'ds://share?body={' +
                    '"url":"' + this.shareConfig.url + '",' +
                    '"title":"' + this.shareConfig.title + '",' +
                    '"description":"' + this.shareConfig.description + '",' +
                    '"pic":"' + this.shareConfig.pic + '"}';
            } else {
                this.getShareInfo(() => {
                    this.showShare = true;
                });
            }
        },
        //未登录情况下的分享
        registerShareInfo: function() {
            var unionId = Vue.weixin.getUnionid();
            var shareUrl = Vue.utils.getRelatedUrl();
            shareUrl += shareUrl.indexOf('?') > -1 ? '&createUnionid=' + unionId : '?createUnionid=' + unionId;

            var data = {
                link: Vue.utils.getHost() + '/share.html?redirectUrl=' + encodeURIComponent(Vue.utils.getHost() + shareUrl),
                title: this.brandName,
                desc: '',
                imgUrl: this.brandLogo
            }
            Vue.weixin.weixinShare(data);
        },
        //获取分享信息
        getShareInfo: function(fn) {
            var unionId = Vue.weixin.getUnionid();
            unionId = unionId ? '&createUnionid=' + unionId : '';

            if (this.shareConfig) {
                if (typeof fn == 'function') {
                    fn({
                        link: this.shareConfig.url,
                        title: this.shareConfig.title,
                        desc: this.shareConfig.description,
                        imgUrl: this.shareConfig.pic
                    });
                }
            } else {
                var url = config.apiHost + '/api/share/shareInfo';
                var param = {
                    type: 3,
                    ut: Vue.auth.getUserToken(),
                    paramId: this.brandIds
                };
                Vue.api.get(url, param, (res) => {
                    this.shareConfig = {
                        url: res.data.linkUrl + unionId,
                        title: res.data.title,
                        description: res.data.content,
                        pic: res.data.sharePicUrl
                    };
                    if (typeof fn == 'function') {
                        fn({
                            link: this.shareConfig.url,
                            title: this.shareConfig.title,
                            desc: this.shareConfig.description,
                            imgUrl: this.shareConfig.pic
                        });
                    }
                }, () => {
                    this.registerShareInfo();
                });
            }
        },
        //重置图片大小
        resizeImgHeight: function() {
            Vue.nextTick(function() {
                var width = $('.ui-col-50 .img-warp').width();
                $('.ui-col-50 .img-warp').height(width);

                var width2 = $('.ui-col-50 img').width();
                $('.ui-col-50 img').height(width2);
            })
        },
    }
});