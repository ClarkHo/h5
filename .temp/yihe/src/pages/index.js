import Vue from "vue";
import UiFooter from "../components/ui-footer.vue";
import UiShare from "../components/ui-share.vue";
import UiScrollTop from "../components/ui-scroll-top.vue";
import VueLazyload from 'vue-lazyload';
import config from "../config/default.js";
Vue.use(VueLazyload,{
    //loading:config.defaultImg
})
var vm;

var navScroll;

vm = new Vue({
    el: 'body',
    components: { UiFooter,UiShare,UiScrollTop },
    data: {
        companyId: Vue.mallSettings.getCompanyId(),
        ut: Vue.auth.getUserToken(),
        supportDistribution: false,//是否支持分销功能
        distributor: {},    //分销商信息
        msgSummary:[],
        ad_banner:[],        //轮播数据
        ad_channel: [],        //分类导航
        video: [],     //视频广告
        title_one:[],
        entry_one:[],
        product_one:[],
        title_two:[],
        entry_two:[],
        product_two:[],
        title_three:[],
        entry_three:[],
        product_three:[],
        title_four:[],
        entry_four:[],
        product_four:[],
        title_five:[],
        entry_five:[],
        product_five:[],
        title_six:[],
        entry_six:[],
        product_six:[],
        title_seven:[],
        entry_seven:[],
        product_seven:[],
        title_eight:[],
        entry_eight:[],
        product_eight:[],
        title_nine:[],
        entry_nine:[],
        product_nine:[],
        title_ten:[],
        entry_ten:[],
        product_ten:[],
        navList:[],
        navCategoryIds:0,
       /*  lunbo: [],          //轮播数据
        
       channer:[],             //分类导航
       
        title_one:[],
        entry_one:[],
        product_one:[],
        title_two:[],
        entry_two:[],
        product_two:[],*/
        tabIndex:0,
        hostList: [],       //热门商品
        
        rightNavFlag: false,//菜单显示隐藏
        qianggou: {},       //秒杀
        pageNo: 1,          
        pageSize: 10,
        headImgurl: null,   //头像
        rankingList: [],    //排行榜
        ad_pic: [],         //banner广告
        hot_activity: [],   //热销
        special: [],        //专场
        
        seckillLink: [],    //秒杀活动 更多链接
        recoList: [],       //商家推荐列表
        showShare: false,   //分享显示隐藏
        shareConfig: null,  //分享配置
        headlines: {},      //头条列表
        placeholder: '',
        ad_brand: [],       //品牌接
        ad_woman: [],       //女装
        ad_women_lunbo:[],  //女装大图
        ad_man: [],         //男装
        ad_man_lunbo:[],    //男装大图
        ad_child: [],       //童装
        ad_child_lunbo: [], //童装大图
        ad_decoration: [],  //布艺饰品
        ad_decoration_lunbo:[],//布艺大图
        ad_sport: [],       //运动
        ad_sport_lunbo:[],  //运动大图
        ad_world: [],       //全球购
        ad_world_lunbo:[],  //全球购大图
        obligate_activity1:[],//预留广告1
        obligate_activity2:[],//预留广告2
        obligate_activity3:[],//预留广告3
        obligate_activity4:[],//预留广告4
        obligate_magic_four:[],//预留四宫格
        obligate_magic_nine:[],//预留九宫格
        obligate_magic_eight:[],//预留八宫格
        obligate_category_1_lunbo:[],//预留广告1
        obligate_category_1: [],
        obligate_category_2_lunbo:[],
        obligate_category_2: [],
        obligate_category_3_lunbo:[],
        obligate_category_3: [],
        obligate_category_4_lunbo:[],
        obligate_category_4:[],
        //tan_ping: [],       //弹屏
        miaosha_rukou: [],   //轮播下方广告
        screenIndex: 0,     //是首屏
        showTanping: false, //显示弹屏
        tanpingClose: false, //弹屏关闭按钮
        unionid: '',
        luckyList: [], //免单名单
        free_activity: [],//免单广告
        brand_side: [],//可以滚动的品牌街广告
        channel_background:[],//分类导航背景
        ad_pic_1:[],
        special1: [],        //专场
        brand_weight: $(window).width()*0.8,//品牌宽度
        connection_big_pic:[],
        ad_pic1:[],
        isEnd:false,
        nomore:false,
        addList:[]
    },
    ready: function() {
       if(this.loggedIn){
         //获取消息摘要
         this.getMsgSummary();
       }       
        if(Vue.auth.loggedIn()){
             this.getMsgSummary();
        }
       // this.getlunbo();
       // this.getHotList();
       // this.getCategoryNav();
        //this.getAdBanner();
        //this.getHotActivity();
        //首页广告查询
        this.getIndexAds();
        //排行榜
        this.getRankingList();
        //获取导航条
        this.getNavList();
        /*分销功能*/
        //this.checkSupportDistribution();
        // this.getCurrDistributor();
        
        //顶部渐变
        this.initHeaderGradient();
        // this.getHotList();
        //轮播初始化
        this.initSwipe();
        //this.initSwipe2();
        //秒杀
        this.secondkill();
        //头条滚动初始化
        this.initHeadlineScroll();
        //大图滚动
        this.initBrandScroll();
        //首屏
        this.getFirstScreen();
        this.getHeadlinesList();
        this.getSecondScreen();
        this.getThirdScreen();
        this.getFourthScreen();
       // this.getDistributorRecoList();
       // this.getHotList();
        // }
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getSearchList();
            }else {
                this.nomore = true;
            }
        });
        var that = this;
        Vue.nextTick(function(){
            that.scrollInit();
        })
        
    },
    methods: {
        switchTab:function(obj){
          this.getSearchList();
        },
        //获取导航条
        getNavList:function () {
            var url = '${apiHost}' + '/api/category/list';
            var param ={
                parentId: 0,
                level:10,
            }
            Vue.api.get(url, param, (res) => {
                if(res.data){
                    this.navList = res.data.categorys;
                    this.tabIndex = res.data.categorys[0].categoryId;
                    this.navCategoryIds = res.data.categorys[0].categoryId;
                }
                this.getSearchList();
                var that = this;
                Vue.nextTick(function(){
                    that.scrollInit();
                })
            })
        },
        //分类点击按钮
        getSearchList:function (obj) {
            if(obj){
                this.pageNo = 1;
                // this.hostList = [];
                this.tabIndex=obj.categoryId;
                this.navCategoryIds = obj.categoryId;
            }
            var url = '${apiHost}' + '/api/search/searchList';
            var param = {
                platformId:config.platformId,
                pageNo:this.pageNo,
                pageSize:this.pageSize,
                navCategoryIds:this.navCategoryIds
            }
            Vue.api.get(url, param, (res) => {
                if(res.data && res.data.productList){
                    if(obj){
                        this.hostList = res.data.productList;
                    }else{
                        this.hostList = this.hostList.concat(res.data.productList);
                    }
                    
                }
                if(res.data.productList.length<this.pageSize&&res.data.productList.length!==0){
                        this.isEnd = true;
                }else if(res.data.productList.length==0){
                    this.nomore =true;

                }
            })
        },
         //获取消息摘要
        getMsgSummary: function() {
            var params = {
                ut: this.ut,
                companyId: this.companyId
            };
            Vue.api.get('${apiHost}' + "/api/social/vl/message/getMsgSummary", params, (result) => {

                this.msgSummary = result.data;
                // this.msgSummary_customer = result.data.customer;
                // this.msgSummary_message = result.data.message;

            });
        },
        //顶部导航初始化
        scrollInit: function () {
            Vue.nextTick(function () {
                if($('.ui-scroller').length > 0) {
                    navScroll = new fz.Scroll('.ui-scroller', {
                        scrollY: false,
                        scrollX: true
                    });
                }
                    
            })
        },
        //检查是否支持分销功能
      /*  checkSupportDistribution: function () {
            var params = { data: { companyId: this.companyId, mainModule:"AGENT_MODULE",subModule:""} };
            Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
                this.supportDistribution = result.resultData == 1;
                if(this.supportDistribution){
                    this.getCurrDistributor();
                }
            });
        },*/
        //大图滚动
        initBrandScroll: function () {
            Vue.nextTick(function () {
                $('.brands-scroll').each(function () {
                    if($(this).find('.brand').length > 1) {
                        new fz.Scroll(this, {
                            scrollY: false,
                            scrollX: true
                        });
                    }
                });
            })
        },
        //轮播初始化
        initSwipe: function () {
            Vue.nextTick(function () {
                $('.swipe').each(function () {
                    var points = $(this).find('.swipe-point li');
                    Swipe(this, {
                        auto: 3000,
                        continuous: true,
                        disableScroll: false,
                        callback: function (i, ele) {
                            points.removeClass('active').eq(i).addClass('active');
                        }
                    });
                });

            })
        },
        //商家推荐轮播初始化
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
        //顶部渐变初始化
        initHeaderGradient: function () {
            setTimeout(function () {
                var sh = $('#slider').height();//轮播图高度
                if(document.body.scrollTop > sh) {
                    $('header').css('background', 'rgba(214,38, 93, 0.8)');
                }
                $(window).scroll(function () {
                    var scTop = document.body.scrollTop;
                    if(scTop <= sh) {
                        $('header').css('background', 'rgba(214, 38,93, '+ (scTop/sh-0.2) +')');
                    }else {
                        $('header').css('background', 'rgba(214, 38, 93, 0.8)');
                    }
                });
            }, 500);
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.prod-img img').width();
                $('.prod-img img').height(width);
            })
        },
        //初始化横向滚动
        initScrollX: function () {
            Vue.nextTick(function () {
                $('.transverse').each(function (i, el) {
                    new fz.Scroll(el, {
                        scrollY: false,
                        scrollX: true
                    });
                });
            });
        },
        //播放视频
        playDsVideo: function (url) {
            $('.video-inner').html('<video autoplay controls width="100%" src="'+url+'"></video>');
        },
        //首页广告查询
        getIndexAds: function () {
            var url = '${apiHost}' + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: config.pageCode,
                adCode:'ad_banner,ad_channel,video,searchword,1f_title,1f_spread_entry1,1f_spread_product,2f_title,2f_spread_entry1,2f_spread_product',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.ad_banner=res.data.ad_banner;
                this.ad_channel = res.data.ad_channel;
                //首页视频
                this.video=res.data.video;
                this.title_one=res.data['1f_title'];
                this.entry_one=res.data['1f_spread_entry1'];
                this.product_one=res.data['1f_spread_product'];
                this.title_two=res.data['2f_title'];
                this.entry_two=res.data['2f_spread_entry1'];
                this.product_two=res.data['2f_spread_product'];
                this.initSwipe();
                //搜索提示词
                var words = [];
                if (res.data.searchword && res.data.searchword.length > 0) {
                    res.data.searchword.forEach((v)=> {
                        words.push(v.content || '')
                    })
                    this.placeholder = words.join(' ');
                }
            });
        },
        //排行榜
        getRankingList: function () {
            // var url = '${apiHost}' + '/api/search/searchList?sortType=volume4sale_desc&companyId='+ this.companyId +'&keyword=*****&pageSize=10';
            var url = '${apiHost}' + '/api/search/searchList?sortType=volume4sale_desc'+'&keyword=*****&pageSize=10';
            Vue.api.get(url, null, (res) => {
                this.rankingList = res.data.productList;
                this.initScrollX();
            });
        },
        //商家推荐
        getRecoList: function (did) {
            var url = '${apiHost}' + '/api/product/recoList';
            var param = {
                distributorId: did,
                pageSize: 10,
                pageNo: 1,
                platformId: config.platformId
            };
            Vue.api.get(url, param, (res) => {
                var list = [];
                var temp = [];
                for(var i in res.data.data) {
                    if(i % 2 == 0) {
                        temp = [];
                    }
                    if(!res.data.data[i].promotionIconTexts) {//如果为null，初始化为空数组
                        res.data.data[i].promotionIconTexts = [];
                    }
                    for(var j in res.data.data[i].promotionInfo) {
                        for(var k in res.data.data[i].promotionInfo[j].promotions) {
                            res.data.data[i].promotionIconTexts.push(res.data.data[i].promotionInfo[j].promotions[k].iconText);
                        }
                    }
                    temp.push(res.data.data[i]);
                    if(i % 2 == 0) {
                        list.push(temp);
                    }
                }
                this.recoList = list;
                this.initSwipe2();
            });
        },
        //更多推荐
        getHotList: function () {
            var url = '${apiHost}' + '/api/product/hotlist?pageCode='+config.pageCode+'&platform=2&pageSize='+this.pageSize+'&pageNo=' + this.pageNo;
            Vue.api.get(url, null, (res) => {
                if((res.data||[]).length > 0) {
                    for(var i in res.data) {
                        if(!res.data[i].promotionIconTexts) {//如果为null，初始化为空数组
                            res.data[i].promotionIconTexts = [];
                        }
                        for(var j in res.data[i].promotionInfo) {
                            for(var k in res.data[i].promotionInfo[j].promotions) {
                                res.data[i].promotionIconTexts.push(res.data[i].promotionInfo[j].promotions[k].iconText);
                            }
                        }
                    }
                    this.hostList = this.hostList.concat(res.data);
                    if(res.data.length<this.pageSize&&res.data.length!==0){
                        this.isEnd = true;
                    }
                    else if(res.data.length==0){
                        this.nomore =true;

                    }
                }else{
                    this.nomore = true;
                }
                // if(realPriceStock)
                //     this.getPriceStockList((function(productList){
                //         "use strict";
                //         var itemIds=[];
                //         for(let p of productList){
                //             itemIds.push(p.mpId)
                //         }
                //         return itemIds.join();
                //     })(res.data));
                // this.totalCount = res.data.total || 100;
                this.resizeImgHeight();
            }, () => {
                //处理掉不显示报错
            });
        },
        // getHotList: function () {
        //     var url = '${apiHost}' + '/api/product/hotlist?pageCode='+config.pageCode+'&platform=2&pageSize='+this.pageSize+'&pageNo='+this.pageNo;
        //     Vue.api.get(url, null, (res) => {
        //         if(res.data) {
        //             for(var i in res.data) {
        //                 if(!res.data[i].promotionIconTexts) {//如果为null，初始化为空数组
        //                     res.data[i].promotionIconTexts = [];
        //                 }
        //                 for(var j in res.data[i].promotionInfo) {
        //                     for(var k in res.data[i].promotionInfo[j].promotions) {
        //                         res.data[i].promotionIconTexts.push(res.data[i].promotionInfo[j].promotions[k].iconText);
        //                     }
        //                 }
        //             }
        //             this.hostList = this.hostList.concat(res.data);
        //             this.resizeImgHeight();
        //         }
        //     });
        // },
        //秒杀
        secondkill: function () {
            var url = '${apiHost}' + '/api/promotion/secondkill/list?promotionCount=1&promotionProductCount=10&companyId='+this.companyId + '&nocache=' + (new Date().getTime());
            Vue.api.get(url, null, (res) => {
                //数据模板化
                Vue.getSysTime((rtime) => {
                    for(var i in res.data) {
                        if(res.data[i].startTime <= rtime.data.timestamp && rtime.data.timestamp < res.data[i].endTime) {
                            res.data[i].effective = true;//是否生效
                            if(res.data[i].endTime > rtime.data.timestamp) {//结束时间大于系统时间
                                //倒计时开始
                                var ct = (res.data[i].endTime - rtime.data.timestamp)/1000;//相差秒数
                                this.startCountDown(ct, res.data[i]);

                                //档期
                                res.data[i].schedule = res.data[i].statusStr;
                            }
                        }else {
                            res.data[i].effective = false;//是否生效
                            //档期
                            res.data[i].schedule = res.data[i].statusStr;

                            var delay = res.data[i].startTime - rtime.data.timestamp;
                            var ct = (res.data[i].endTime - res.data[i].startTime)/1000;
                            this.launchCountDown(delay, ct, res.data[i]);
                        }
                        res.data[i].hh = '00';
                        res.data[i].mm = '00';
                        res.data[i].ss = '00';
                    }
                    this.qianggou = res.data;
                    this.initScrollX();
                })

            }, () => {
                //处理掉不显示报错
            });
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
                    for(var i in this.qianggou) {
                        if(this.qianggou[i].promotionId == qg.promotionId) {
                            this.qianggou.splice(i, 1);
                            return;
                        }
                    }
                }
            }, 1000);
        },
        //控制倒计时开始
        launchCountDown: function (delay, time, qg) {
            setTimeout(() => {
                this.startCountDown(time, qg);
                qg.effective = true;
            }, delay);
        },
        //获取分销商信息
       /* getCurrDistributor: function () {
            if(Vue.localStorage.contains('currDistributor')) {
                this.distributor = Vue.localStorage.getItem('currDistributor');
                this.getRecoList(this.distributor.id);
            }else {
                var url = '${apiHost}' + '/api/seller/distributor/currDistributor';
                var param = {
                    ut: this.ut,
                    shareCode: Vue.cookie.getCookie('shareCode')
                };
                Vue.api.get(url, param, (res) => {
                    this.distributor = res.data;
                    Vue.localStorage.setItem('currDistributor',res.data);
                    this.getRecoList(res.data.id);
                });
            }
        },*/
        //点击分享
      /*  clickShare: function () {
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取到did
                location.href = '${contextPath}/login.html';
                return;
            }
            //获取分享信息
            var url = '${apiHost}' + '/api/share/shareInfo';
            var param = {
                type: 1,
                ut: this.ut
            };
            Vue.api.get(url, param, (res) => {
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                this.showShare = true;
                this.rightNavFlag = false;
            });
        },*/
        //查询头条
        getHeadlinesList: function () {
            var url = '${apiHost}' + '/cms/view/h5/headlinesList';
            var param = {
                categoryType: 2,
                currentPage: 1,
                itemsPerPage: 5
            };
            Vue.api.get(url, param, (res) => {
                this.headlines = res.data;
                this.initHeadlineScroll();
            });
        },
        //头条滚动初始化
        initHeadlineScroll: function () {
            Vue.nextTick(function () {
                var $ul = $('.headlines ul');
                var $lis = $ul.find('li');
                var liHeight = $lis.height();
                if($lis.length > 1) {
                    setInterval(function() {
                        $ul.append($ul.children().first());
                    }, 5000);
                }
            })
        },
        //首屏
        getFirstScreen: function () {
            var url = '${apiHost}' + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: config.pageCode,
                adCode:'3f_title,3f_spread_entry1,3f_spread_product,4f_title,4f_spread_entry1,4f_spread_product',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.title_three=res.data['3f_title'];
                this.entry_three=res.data['3f_spread_entry1'];
                this.product_three=res.data['3f_spread_product'];
                this.title_four=res.data['4f_title'];
                this.entry_four=res.data['4f_spread_entry1'];
                this.product_four=res.data['4f_spread_product'];
                this.initSwipe();//初始化轮播
                this.initBrandScroll();//初始化
                //搜索提示词
                var words = [];
                if (res.data.searchword && res.data.searchword.length > 0) {
                    res.data.searchword.forEach((v)=> {
                        words.push(v.content || '')
                    })
                    this.placeholder = words.join(' ');
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //第二次
        getSecondScreen: function () {
            var url = '${apiHost}' + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: config.pageCode,
                adCode:'5f_title,5f_spread_entry1,5f_spread_product,6f_title,6f_spread_entry1,6f_spread_product',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.title_five=res.data['5f_title'];
                this.entry_five=res.data['5f_spread_entry1'];
                this.product_five=res.data['5f_spread_product'];
                this.title_six=res.data['6f_title'];
                this.entry_six=res.data['6f_spread_entry1'];
                this.product_six=res.data['6f_spread_product'];
                this.initSwipe();//初始化轮播
                this.initBrandScroll();//初始化
                //this.ad_pic_1 = res.data.loucengyuliu11;
               // this.special1 = res.data.loucengyuliu12;
                //预留活动区
                /*this.obligate_activity1=res.data.loucengyuliu8;
                this.obligate_activity2=res.data.loucengyuliu9;
                this.obligate_activity3=res.data.loucengyuliu10;
                this.obligate_activity4=res.data.loucengyuliu11;
                this.obligate_magic_four=res.data.loucengyuliu12;
                this.obligate_magic_nine=res.data.loucengyuliu13;
                this.obligate_magic_eight=res.data.loucengyuliu14;*/

            }, () => {
                //处理掉不显示报错
            });
        },
        //第三次
        getThirdScreen: function () {
            var url = '${apiHost}' + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: config.pageCode,
                adCode:'7f_title,7f_spread_entry1,7f_spread_product,8f_title,8f_spread_entry1,8f_spread_product',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.title_seven=res.data['7f_title'];
                this.entry_seven=res.data['7f_spread_entry1'];
                this.product_seven=res.data['7f_spread_product'];
                this.title_eight=res.data['8f_title'];
                this.entry_eight=res.data['8f_spread_entry1'];
                this.product_eight=res.data['8f_spread_product'];
                this.initSwipe();//初始化
            }, () => {
                //处理掉不显示报错
            });
        },
        setArr:function(obj){
              if(obj&&obj.length>0){
                var list = [];
                var temp = [];
                for(var i in  obj) {
                    if(i % 4 == 0) {
                        temp = [];
                    }
                    temp.push( obj[i]);
                    if(i % 4 == 0) {
                        list.push(temp);
                    }
                }
               return list;
              }
        },
        //第四次
        getFourthScreen: function () {
            var url = '${apiHost}' + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: config.pageCode,
                adCode:'9f_title,9f_spread_entry1,9f_spread_product,10f_title,10f_spread_entry1,10f_spread_product',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.title_nine=res.data['7f_title'];
                this.entry_nine=res.data['7f_spread_entry1'];
                this.product_nine=res.data['7f_spread_product'];
                this.title_ten=res.data['8f_title'];
                this.entry_ten=res.data['8f_spread_entry1'];
                this.product_ten=res.data['8f_spread_product'];
                this.initSwipe();//初始化
            }, () => {
                //处理掉不显示报错
            });
        }
    }
});
vm.$refs.scrolltop.init();