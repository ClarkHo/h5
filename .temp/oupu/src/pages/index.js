import Vue from "vue";
import UiFooter from "../components/ui-footer.vue";
import UiShare from "../components/ui-share.vue";
import UiScrollTop from "../components/ui-scroll-top.vue";
import UiMessage from "../components/ui-message.vue";
import UiCube from "../components/ui-cube.vue";
import UiSetPosition from "../components/ui-set-position.vue";
import VueLazyload from 'vue-lazyload';
import config from "../../env/config.js";

Vue.use(VueLazyload, {
    loading: config.defaultImg
})
var zhiboLink = 'laiyifen.umaman.com/zhibo';
function goZhiBoLink(url){
    if (Vue.auth.loggedIn()) {
        //获取用户信息
        var params = {
            ut: Vue.auth.getUserToken(),
            companyId: Vue.mallSettings.getCompanyId(),
            cashe: Date.parse(new Date())
        };
        Vue.api.get(config.apiHost + "/api/my/user/info", params, (result) => {
            if(result.data.headPicUrl==""){
                result.data.headPicUrl="${staticPath}/images/logo.png";
            }
            if (result.data.nickname) {
                if (url) location.href = url + '&nickname=' + encodeURI(result.data.nickname) + '&mobile=' + result.data.mobile + '&avatar=' + encodeURI(result.data.headPicUrl);
            } else {
                var nick = result.data.mobile.substring(0, 2) + "****" + result.data.mobile.substring(9, 11);
                if (url) location.href = url + '&nickname=' + nick + '&mobile=' + result.data.mobile + '&avatar=' + encodeURI(result.data.headPicUrl);
            }
        });
    } else {
        location.href = '/login.html?fromUrl=' + encodeURIComponent(url);
    }
}
var vm = new Vue({
    el: 'body',
    components: {UiFooter, UiShare, UiScrollTop, UiSetPosition, UiMessage,UiCube},
    data: {
        companyId: Vue.mallSettings.getCompanyId(),
        locationCity: '',
        ut: Vue.auth.getUserToken(),
        pageNo: 1,
        pageSize: 10,
        totalCount: 0,
        nomore: false,
        moduleCategory: [],             //栏目分类
        moduleCategoryR1c1b: [],        //单行大图栏目分类
        selectedmoduleCategoryId: '',   //选中的栏目id
        selectedmoduleCategoryIdR1c1b: '',   //选中的单列大图栏目id
        scrollModuleList: [],             //栏目商品数组，用于判断滚动加载
        moduleProdList: [],             //栏目商品
        moduleProdListR1c1b: [],        //单行大图栏目商品
        homePageData: [],   //首页数据
        lunbo: [],          //轮播
        channel: [],        //分类导航
        entrance: [],       //入口
        placeholder: [],    //热搜词
        featuresTheme: {},  //特色主题
        hotProdList: [],    //热销榜单
        moduleId: '',       //模块id
        moduleType: '',       //模块id
        secondKill: {},     //秒杀
        rankingList: [],    //排行榜
        headlines: [],      //头条
        multiPic: {},       //热图
        slider: {},         //轮播
        channels: [],       //图片导航
        cartCount: 0,
        showLocation: false,
        floatTail: [],
        iShowFloatTail: true,
        canScroll: false,
        adCode: '',
        lock:false,

        newcomers_popup: {}, //弹屏广告相关
        tanPin: false,
        tanPinLink: '',
        loggedIn: Vue.auth.loggedIn(),
        isNewCustomer: false,
        pageInfo:{}, //页面信息
        bgStyle:{},
        screenWidth:'',//页面宽度
        regisShow:false, //注册送券,
        regisCouponsShow:false,//注册送的券展示
        canUseCouponList:[],//注册送的券
        regis_popup:{},//注册弹屏相关
        adRegisBack:false,//注册回来要展示领到的券标识
        shareConfig: {}, //分享配置
        showShare: false,   //显示分享
        showAddressIcon : false
    },
    ready: function () {
        this.screenWidth = document.body.clientWidth;
        var self = this;
        if (!Vue.area.getArea().pN) {
            var timer = setInterval(function(){
                if (Vue.area.getArea().pN) {
                    self.locationCity = Vue.area.getArea().pN;
                    self.showAddressIcon = true;
                    clearInterval(timer); 
                }
            },500);
        } else {
            self.locationCity = Vue.area.getArea().pN;
            self.showAddressIcon = true;
        }

        //初始化PageRestorer (1分钟)
        Vue.pageRestorer.init(this, "index", 1000 * 60);
        //restore页面的内容
        if (Vue.pageRestorer.restore()) {
            this.initHeadlineScroll();
            this.initScrollX();
            this.initSwipe();
            this.initFixedNav();
            this.resizeImgHeight();

        } else {
            this.getHomePage();
        }

        //滚动加载更多数据
        Vue.scrollLoading({
            triggerHeight:600,
            callback:() => {
                if (this.scrollModuleList) {
                    if (this.scrollModuleList.length < this.totalCount) {
                        if (this.canScroll) {
                            this.pageNo += 1;
                            this.getModuleProdList(-1,this.moduleType,this.moduleId);
                        }
                    } else {
                        this.nomore = true;
                    }
                }
            }
        });
        
        if (!sessionStorage.getItem('hasSetPosition')) {
            this.rePosition();
        }

        if (!Vue.sessionStorage.getItem('newcomers_flag')||!Vue.sessionStorage.getItem('adRegis_flag')) {
            this.getNewcomersAdv();        
        }
        if(Vue.sessionStorage.getItem('adRegisBack')){
            this.getMyCoupons();
            this.adRegisBack = true;
            Vue.sessionStorage.removeItem('adRegisBack');
        }

    },
    methods: {
        getMyCoupons: function () {
            var url = config.apiHost + '/api/my/coupon';

            var param = {
                ut: this.ut,
                companyId: this.companyId,
            };

            Vue.api.get(url, param, (result) => {
                if(result.data.canUseCouponList && result.data.canUseCouponList.length > 0){
                    this.canUseCouponList = result.data.canUseCouponList;
                    this.regisCouponsShow = true;
                }
            });
        },
        //轮播初始化
        initSwipe: function () {
            Vue.nextTick(function () {
                $('.swipe').each(function () {
                    var $this = $(this);
                    if ($this.find('figure').length >= 1) {
                        // if($this.css('visibility') == 'visible') {//如果元素可见，代表已经初始化，防止二次初始化
                        //     return;
                        // }
                        Swipe(this, {
                            auto: 3000,
                            continuous: true,
                            disableScroll: false,
                            callback: function (i, ele) {
                                var points = $this.find('.swipe-point li');
                                if (points.length == 2 && i >= 2) {
                                    i -= 2;
                                }
                                points.removeClass('active').eq(i).addClass('active');
                            }
                        });

                    }
                });

            })
        },
        //顶部渐变初始化
        initHeaderGradient: function () {
            setTimeout(function () {
                var sh = 180;//轮播图高度
                if (document.body.scrollTop > sh) {
                    $('.ui-header-index').css('background', 'rgba(255, 105, 0, 0.8)');
                }
                $(window).scroll(function () {
                    var scTop = document.body.scrollTop;
                    if (scTop <= sh) {
                        $('.ui-header-index').css('background', 'rgba(0, 0, 0, ' + (scTop / sh - 0.2) + ')');
                    } else {
                        $('.ui-header-index').css('background', 'rgba(255, 105, 0, 0.8)');
                    }
                });
            }, 500);
        },
        //初始化浮动分类导航
        initFixedNav: function () {
            // Vue.nextTick(() => {
            //     $(window).scroll(() => {
            //         var wt = $(window).scrollTop();
            //         var wrapperTop = Math.floor($('#lockBar').offset().top - $('#moduleTab').height());
            //         if (wrapperTop <= wt) {
            //             this.lock = true;
                        
            //         } else {
            //             this.lock = false;
            //         }
            //     });
            // });
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.prod-img img').width();
                $('.prod-img img').height(width);
            })
        },
        //重置主题馆图片大小
        resizeImgHeight_ThemeVenue: function () {
            Vue.nextTick(function () {
                setTimeout(function () {
                    var le = $('.theme-venue li:first-child img').height();
                    $('.theme-venue li img').height(le);
                }, 1000);
            })
        },
        //初始化横向滚动
        initScrollX: function () {
            Vue.nextTick(function () {
                $('.transverse').each(function (i, el) {
                    new fz.Scroll(el, {
                        scrollY: false,
                        scrollX: true,
                        //momentum: false
                    });
                });
            });
        },
        //查询头条
        getHeadlinesList: function () {
            var url = config.apiHost + '/cms/view/h5/headlinesList';
            var param = {
                categoryType: 2,
                currentPage: 1,
                itemsPerPage: 8,
                code: 'headlines'
            };
            Vue.api.get(url, param, (res) => {
                this.headlines = res.data;
                this.initHeadlineScroll();
            }, () => {
                //处理掉不显示报错
            });
        },
        //头条滚动初始化
        initHeadlineScroll: function () {
            Vue.nextTick(function () {
                var $ul = $('.headlines ul');
                var $lis = $ul.find('li');
                var liHeight = $lis.height();
                if($lis.length > 1) {
                    setInterval(function() { //终于解决了安卓滚动重影问题！！！背景色
                        $ul.css({
                            '-webkit-transform':'translate3d(0,-44px,0)',
                            '-webkit-transition':'-webkit-transform .5s'
                        });
                        setTimeout(function () {
                            $ul.css({
                                '-webkit-transform': 'translate3d(0,0,0)',
                                '-webkit-transition': null
                            });
                            $ul.append($ul.children().first());
                        }, 500);
                    }, 5000);
                }
            })
        },
        //获取商品的栏目的分类
        getModuleDataCategory: function (moduleId,type) {
            var url = config.apiHost + '/cms/page/module/getModuleDataCategory';
            var params = {
                moduleId: moduleId,//栏目id
            };
            Vue.api.get(url, params, (res) => {
                if (res.data && res.data.length > 0) {
                    switch (type) {
                        case 'goods':
                            this.moduleCategory = res.data;
                            break;
                        case 'goods-r1c1b':
                            this.moduleCategoryR1c1b = res.data;
                            break;
                    
                        default:
                            break;
                    }
                    //this.selectedmoduleCategoryId = res.data[0].categoryId;//默认
                    //获取栏目商品
                    this.initFixedNav();
                    $('.prod-list').css('min-height', $(window).height() - $('.ui-header').height() - $('.ui-footer').height() - $('.prod-tab').height() - 60 + 'px');
                    this.getModuleProdList(res.data[0].categoryId,type,moduleId);
                    this.initScrollX();
                } else {
                    this.getModuleProdList(-1,type,moduleId);
                }
            }, () => {
                //处理掉不显示报错
            });
        }, 
        //获取栏目商品数据
        getModuleProdList: function (categoryId,type,moduleId) {
            var selectedId;
            if (categoryId) {
                switch (type) {
                    case 'goods':
                    this.selectedmoduleCategoryId = categoryId;
                        break;
                    case 'goods-r1c1b':
                    this.selectedmoduleCategoryIdR1c1b = categoryId;
                        break;
                
                    default:
                        break;
                }
                
                this.pageNo = 1;
                this.pageSize = 10;
                this.totalCount = 0;
                //this.moduleProdList = [];
            }
            switch (type) {
                case 'goods':
                selectedId = this.selectedmoduleCategoryId;
                    break;
                case 'goods-r1c1b':
                selectedId = this.selectedmoduleCategoryIdR1c1b;
                    break;
            
                default:
                selectedId = '';
                    break;
            }
            var url = config.apiHost + '/cms/page/module/getModuleData';
            var params = {
                moduleId: moduleId,
                categoryId: selectedId,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get(url, params, (res) => {
                if (res.data.listObj && res.data.listObj.length > 0) {
                    this.scrollModuleList = res.data.listObj;

                    var mpIds=[];
                    for(let p of res.data.listObj){
                        mpIds.push(p.mpId)
                    }
                    mpIds = mpIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(mpIds,res.data.listObj,null,(obj)=>{
                        switch (type) {
                            case 'goods':
                                if (categoryId){
                                    this.moduleProdList = obj;
                                }else{
                                    this.moduleProdList = this.moduleProdList.concat(obj);
                                }
                                break;
                            case 'goods-r1c1b':
                                if (categoryId){
                                    this.moduleProdListR1c1b = obj;
                                }else{
                                    this.moduleProdListR1c1b = this.moduleProdListR1c1b.concat(obj);
                                }
                                break;
                        
                            default:
                                break;
                        }
                    });

                    this.resizeImgHeight();
                } else {
                    this.nomore = true;
                }
                this.totalCount = res.data.total || 0;
            }, () => {
                //处理掉不显示报错
            });
        },
        //排行榜
        getRankingList: function (moduleId) {
            var url = config.apiHost + '/cms/page/module/getModuleData';
            var params = {
                moduleId: moduleId,
                categoryId: '',
                pageNo: 1,
                pageSize: 10
            };
            Vue.api.get(url, params, (res) => {
                if (res.data.listObj && res.data.listObj.length > 0) {
                    var mpIds=[];
                    for(let p of res.data.listObj){
                        mpIds.push(p.mpId)
                    }
                    mpIds = mpIds.join();
                    //获取实时价格
                    Vue.getPriceAndStock(mpIds,res.data.listObj,null,(obj)=>{
                        this.rankingList = obj;
                    });

                    this.initScrollX();
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //获取首页数据
        getHomePage: function () {
            var url = config.apiHost + '/cms/page/getAppHomePage';
            var param = {};
            Vue.api.get(url, param, (res) => {
                if(res.data.pageInfo){
                    this.pageInfo=res.data.pageInfo;
                   if(this.pageInfo.bgImg){
                        this.bgStyle={
                            background:'url('+this.pageInfo.bgImg+') repeat-y' 
                        } 
                   } else if(this.pageInfo.bgColor){
                        this.bgStyle={
                            backgroundColor: this.pageInfo.bgColor
                        }
                   }
                }
                var adCode = '';
                for (var i = 0; i < res.data.dataList.length; i++) {
                    if (res.data.dataList[i].staticData && res.data.dataList[i].staticData.ad_code) adCode += res.data.dataList[i].staticData.ad_code + ',';
                    if (res.data.dataList[i].templateCode == 'spacing') res.data.dataList[i].spacing = res.data.dataList[i].staticData;
                    //多图 轮播图
                    if (res.data.dataList[i].templateCode == 'slider') res.data.dataList[i].slider = res.data.dataList[i].staticData;
                    //特色主题馆
                    if (res.data.dataList[i].templateCode == 'slideShow') {
                        res.data.dataList[i].featuresTheme = res.data.dataList[i].staticData;
                        if (res.data.dataList[i].featuresTheme.length > 0) {
                            this.resizeImgHeight_ThemeVenue();
                        }
                    }
                    //图片热点
                    if (res.data.dataList[i].templateCode == 'h5_multipic') res.data.dataList[i].multiPic = res.data.dataList[i].staticData;
                    //秒杀
                    if (res.data.dataList[i].templateCode == 'secondKill') res.data.dataList[i].secondKill = res.data.dataList[i].staticData;
                    //本周热销榜单
                    if (res.data.dataList[i].templateCode == 'rank') this.getRankingList(res.data.dataList[i].moduleId);
                    //news
                    if (res.data.dataList[i].templateCode == 'news') this.getHeadlinesList();
                    //获取商品模块id
                    if (res.data.dataList[i].templateCode == 'goods') {
                        if (i == res.data.dataList.length - 1){
                            this.canScroll = true;
                            this.moduleId = res.data.dataList[i].moduleId;
                            this.pageSize = res.data.dataList[i].staticData.displayNum;
                            this.moduleType = res.data.dataList[i].templateCode;
                        } 
                        //获取栏目分类
                        if (res.data.dataList[i].staticData.displayNav == 1) {
                            this.getModuleDataCategory(res.data.dataList[i].moduleId,'goods');
                        } else {
                            this.getModuleProdList(-1,'goods',res.data.dataList[i].moduleId);
                        }

                    }
                    //获取单列大图数据
                    if (res.data.dataList[i].templateCode == 'goods-r1c1b') {
                        if (i == res.data.dataList.length - 1){
                            this.canScroll = true;
                            this.moduleId = res.data.dataList[i].moduleId;
                            this.pageSize = res.data.dataList[i].staticData.displayNum;
                            this.moduleType = res.data.dataList[i].templateCode;
                        }
                        //获取栏目分类
                        if (res.data.dataList[i].staticData.displayNav == 1) {
                            this.getModuleDataCategory(res.data.dataList[i].moduleId,'goods-r1c1b');
                        } else {
                            this.getModuleProdList(-1,'goods-r1c1b',res.data.dataList[i].moduleId);
                        }

                    }
                }
                this.homePageData = res.data.dataList;

                this.adCode = adCode;
                //获取广告数据
                this.getDolphinList(adCode);
                this.initScrollX();
            }, () => {
                //处理掉不显示报错
            });
        },

        //广告
        getDolphinList: function (adCode) {
            var adCode = adCode || this.adCode;
            if (this.iShowFloatTail) {
                if (adCode.length == 0) adCode = 'float_tail';
                else adCode = adCode + 'float_tail';
            }
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_HOME',
                adCode: adCode,
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.lunbo = res.data.ad_banner || [];
                this.channel = res.data.ad_channel || [];
                this.entrance = res.data.ad_entrance || [];
                if (this.iShowFloatTail) this.floatTail = res.data.float_tail[0] || {};
                var words = [];
                if (res.data.searchword && res.data.searchword.length > 0) {
                    res.data.searchword.forEach((v)=> {
                        words.push(v.content || '')
                    })
                    this.placeholder = words.join(' ');
                }
                this.initSwipe();
            }, () => {
                //处理掉不显示报错
            });
        },
        //加入购物车
        addItemInCart: function (item) {
            var params = {
                ut: Vue.auth.getUserToken(),
                mpId: item.mpId,
                num: 1,
                sessionId: Vue.session.getSessionId()
            };
            Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                $.tips({
                    content: "添加成功",
                    stayTime: 2000,
                    type: "success"
                });
                this.getCartCount();
            });
        },
        golink:function (item) {
            if(item.url == '') return;
            // if(item.url.indexOf(zhiboLink) > 0 ){
            //     goZhiBoLink(item.url);
            // } else {
            //     location.href = item.url;
            // }
            location.href = item.url;
        },
        //获取购物车数目
        getCartCount: function () {
            "use strict";
            var params = {
                sessionId: Vue.session.getSessionId(),
                ut: Vue.auth.getUserToken()
            };
            Vue.api.postForm(config.apiHost + "/api/cart/count", params, (res) => {
                this.cartCount = res.data || 0;
            }, () => {
                //处理掉不显示报错
            });
        },
        //更新location
        updateLocation: function () {
            this.locationCity = Vue.area.getArea().pN;
            //重新获取商品数据
            this.initSwipe();
            this.getDolphinList();
        },
        //自动定位
        rePosition: function () {
            var map, geolocation;
            //加载地图，调用浏览器定位服务
            map = new AMap.Map('temp');
            map.plugin('AMap.Geolocation', ()=> {
                sessionStorage.setItem('hasSetPosition', 1);
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true
                });
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', (data)=> {
                    this.onComplete(data);
                });//返回定位信息
                AMap.event.addListener(geolocation, 'error', (data)=> {
                    this.onError(data);
                });//返回定位出错信息
            });
        },
        //获取区域
        getArea: function (data) {
            if (data.city == '') data.city = data.province;
            var param = {
                countryName: '中国',
                provinceName: data.province,
                cityName: data.city,
                areaName: data.district,
            };
            Vue.api.get(config.apiHost + '/api/location/getArea', param, (res) => {
                if (res.data) {                   
                    //判断当前选中的地址是否和自动定位地址一致
                    if (res.data.twoAddress != Vue.area.getArea().pN) {
                        var dialog = $.dialog({
                            title: "",
                            content: "系统定位你在" + res.data.twoAddress + res.data.thrAddress + res.data.fouAddress + "，是否切换?",
                            button: ["取消", "确认"]
                        });
                        dialog.on("dialog:action", (e) => {
                            //点击确定按钮
                            if (e.index == 1) {
                                //保存区域
                                Vue.area.setArea(res.data.twoAddress, res.data.twoCode, res.data.thrAddress, res.data.thrCode, res.data.fouAddress, res.data.fouCode, 1);
                                this.locationCity = Vue.area.getArea().pN;
                            }
                        })
                    }
                }
            });
        },
        onComplete: function (data) {
            this.getArea(data.addressComponent);
        },
        onError: function (data) {
            var dialog = $.dialog({
                title: "",
                content: "欧普想访问您的GPS，请到:设置-隐私-定位 设置允许定位",
                button: ["知道了"]
            });
        },
        //channel link
        toChannelLink: function (item) {
            if(item.linkUrl.indexOf(zhiboLink) > 0 ){
                goZhiBoLink(item.linkUrl);
            } else {
                if (item.name.indexOf('全球尖货') == 0)
                    location.href = '/view/h5/30.html';
                else if (item.linkUrl)
                    location.href = item.linkUrl;
            }

        },
        //弹屏广告
        getNewcomersAdv: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_HOME',
                adCode: 'newcomers_popup,registered_coupon',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };//regis_popup
            Vue.api.get(url, param, (res) => {
                if(res.data.registered_coupon && res.data.registered_coupon.length>0 && !this.loggedIn && !Vue.sessionStorage.getItem('adRegis_flag')){
                    this.regis_popup = res.data.registered_coupon[0];
                    this.regisShow = true;
                    Vue.sessionStorage.setItem('adRegis_flag',1);
                }else if (res.data.newcomers_popup && res.data.newcomers_popup.length>0 && !this.adRegisBack && !Vue.sessionStorage.getItem('newcomers_flag')) {
                    this.newcomers_popup = res.data.newcomers_popup[0];
                    this.tanPinLink = this.newcomers_popup.linkUrl;
                    //判断是否登录
                    if(this.loggedIn){
                        //判断用户类型
                        
                        this.getUserExt();
                    }else{
                        this.tanPin = true;//未登录直接弹出广告
                        Vue.sessionStorage.setItem('newcomers_flag',1);
                    }
                }
            });
        },
        //注册广告点击去注册
        goRegis:function () {
            Vue.sessionStorage.setItem('adRegis',1);
            location.href = 'regis.html';
        },
        //判断新老用户
        getUserExt: function () {
            var url = config.ouserHost + '/ouser-web/user/getUserExtByConditions.do';
            var param = {
                ut: Vue.auth.getUserToken(),
                //userId: '123123',
                userExtKeys:["orderSum","newuser"]
            };
            Vue.api.post(url, param, (res) => {
                if(res.data){
                    if(res.data.userExtMap.newuser == '1'){
                        //新用户
                        this.isNewCustomer = true;
                        this.tanPin = true;
                        Vue.sessionStorage.setItem('newcomers_flag',1);
                    }else{
                        this.isNewCustomer = false;
                    }
                }
            });
        },
        toTanPingLink: function () {
            if (this.isNewCustomer) {
                window.location.href = this.tanPinLink;
            } else {
                window.location.href = "/login.html?from=" + encodeURI(this.tanPinLink) + "&tanAd=" + 1;
            }
        },
        //注册后送券 - 按钮
        goHome: function () {
            let isHome = window.location.href.indexOf('index.html') > -1;
            if (isHome){
                this.regisCouponsShow = false;
            } else {
                window.location.href = "/index.html";
            }

        }
    }
});
