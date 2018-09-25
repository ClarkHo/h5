import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiScrollTop from "../../components/ui-scroll-top.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";
// import VueTouch from "vue-touch";
// Vue.use(VueTouch);

import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload,{
    loading:config.defaultImg
});

const searchHistoryKey = "searchHistory";
const realPriceStock=false;
var hashParams = Vue.utils.hashFormat(window.location.href);
var hashStr = $.param(hashParams);
//获取url 参数 根据类目id或者关键词查找结果
let urlParams = Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
var vm;
vm = new Vue({
    el: 'body',
    components: {UiScrollTop,UiActionsheetPop,UiHeader,UiDropDown},
    data: {
        placehoder:'',
        rightNavFlag: false,
        showSearchPop: false,//默认不显示搜索弹层;显示搜索结果
        showSequencePop: false,//综合弹层
        showGrid: true,//默认显示九宫格
        //saleFlag: true,//销量排序标识
        currentIndex: 0,//以哪种方式排序(选中标红)
        complexText: '综合',//默认综合
        showNotice: false,
        showRecommendNotice: false,
        showNoMore: false,
        showPages:false,
        showFilter:false,
        showAutoFill:false, //显示自动填充

        keyword: '',//关键词
        hotWord: [],//热搜词
        historyWord: [],//搜索历史
        productList: [],//商品列表
        sortByList: [],//排序列表
        sortType:23,//排序方式(积分价格从低到高)
        categoryIds: '',//类目id
        pageNo: 1,//当前页
        pageSize: 20,//当页显示数量
        totalCount: 0,//商品总数

        autoFillList:['a','b','c'], //自动补充搜索词
        timer:null,

        //商品系列属性相关
        showSizePop: false,
        //商品系列属性
        serialAttributes: [],
        //系列商品
        serialProducts: [],
        itemInfo: {},
        itemPreviewImage:'',
        itemAmount: 1,
        zeroRecommendWord:'', //推荐关键字
        zeroRecommendResult:[], //推荐结果列表
        categoryTreeName: '',
        maybeInterestedKeywords:[], //推荐关键字数组
        prices:{
            from:'',
            to:''
        },
        brandList:[],//品牌列表
        brandListBak:'',//品牌列表备份
        showAllBrands:false, //显示所有品牌
        properties:[], //各属性列表
        propertiesBak:'',//各属性列表备份
        selectedPropIds:'',
        selectedPropIdsList:[],
        selectedBrandIds:[],
        loginFlg:false,
        loading:false, //正在加载中

        //活动商品
        promotionId: '',//促销活动id
        cartExt: {},//购物车促销信息
        showGifts:false, //显示赠品
        giftList: [],//赠品列表
        community:true,
        categoryTreeResult:[],//分类列表
        fromCategoryPage: false,
        preOrderInfo: {},
        promotionDetail: {},//促销详情

        isCategoryNum: 0,//
        pageNoView: 1,
        totalCountView: 0,
        pageSizeView: 10,

        showcategoryTreeName: false,
        isFromSearch: false,
        stopDropDown: false,
        searchWordObj:null,//搜索词相关对象
        productType:urlParams.productType?urlParams.productType:null,//普通商品、优惠券
        pointPriceRange:urlParams.pointPriceRange?urlParams.pointPriceRange:null,//积分区间
        pointRange:[
            {
                "text":'不限',
                "value":'0',
                "check":true
            },
            {
                "text":'0-100',
                "value":'0,100',
                "check":false
            },
            {
                "text":'100-500',
                "value":'100,500',
                "check":false
            },
            {
                "text":'500-1000',
                "value":'500,1000',
                "check":false
            },
            {
                "text":'1000-2000',
                "value":'1000,2000',
                "check":false
            },
            {
                "text":'2000-5000',
                "value":'2000,5000',
                "check":false
            },
            {
                "text":'5000以上',
                "value":'5000,',
                "check":false
            },
        ],
        selectedPointRange:{
            "text":'不限',
            "value":'0',
            "check":true
        },//选中的积分区间
    },
    ready: function() {
        //如果分享地址里中文被多次转码
        if(location.href.indexOf('%25')>=0) location.replace(decodeURIComponent(location.href));
        //初始化PageRestorer
        Vue.pageRestorer.init(this, "search");
        Vue.event.on("pageShow", this.pageShowHandler);
        //restore页面的内容
        if (Vue.pageRestorer.restore()) {
            this.resizeImgHeight();
            if (urlParams.promotionId) this.getCartExt();
        } else {
            this.init();
        }
        if(urlParams.pointPriceRange){
            this.pointRange.forEach((item) => {
                if(urlParams.pointPriceRange == item.value){
                    this.selectedPointRange = item;
                    item.check = true;
                } else{
                    item.check = false;
                }
            })
        } else{
            this.selectedPointRange = {
                "text":'不限',
                "value":'0',
                "check":true
            }
        }
        //滚动加载更多数据
        Vue.scrollLoading({triggerHeight: 1000, callback: () => {
            if(!this.showSearchPop && !this.showSequencePop && this.totalCount>0){
                if (this.pageNo < Math.ceil(this.totalCount/this.pageSize)) {
                    this.pageNo += 1;
                    this.loadSearchList(true);
                    this.showPages = true;
                }else {
                    this.showNoMore = true;
                }
            }
        }});

    },
    methods: {
        selectPointRange:function (item) {
            if(item.check){
                item.check = false;
                this.pointPriceRange = null;
                this.selectedPointRange = null;
                return;
            }
            this.pointRange.forEach((v) => {
                v.check = false;
            })
            item.check = true;
            this.pointPriceRange = item.value;
            this.selectedPointRange = item;
        },
        dropDown: function () {
            this.pageNo = 1;
            this.loadSearchList(true);
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        switchGrid: function () {
            this.showGrid = !this.showGrid;

            Vue.nextTick(() => {
                this.resizeImgHeight();
                this.$Lazyload.lazyLoadHandler();
            })
        },
        pageShowHandler: function (res) {
            if(urlParams.promotionId){
                this.getCartExt();
            }
        },
        init: function () {

            if (urlParams.keyword) {
                this.keyword = urlParams.keyword;
                this.addSearchHistory(this.keyword);
                // this.loadSearchList(false);
            }
            if (urlParams.categoryId) {
                this.categoryIds = urlParams.categoryId;
                //this.loadSearchList(false);
            }

            if(!urlParams.keyword &&!urlParams.categoryId && !urlParams.promotionId && !urlParams.pointPriceRange && !urlParams.productType){
                //修复过滤后显示热门商品问题
                if (urlParams.filter) {
                    return;
                }

                //显示搜索弹层
                this.showSearchPop = true;
                $('#searchInput').focus();
                //初始化热搜词
                //this.searchHotWord();
                //初始化默认显示词
                // this.getPlaceHoder();

                if(Vue.auth.loggedIn()) {
                    this.loginFlg=true;
                    this.getUserHistory();
                }else{
                    this.historyWord = Vue.localStorage.getItem(searchHistoryKey) ? Vue.localStorage.getItem(searchHistoryKey) : [];
                }
            }else{
                this.loadSearchList(false,true);
            }
        },
        //获取热搜词
        // searchHotWord: function(){
        //     var url = config.apiHost + '/api/search/searchHotWord';
        //     var param = {
        //         ut: Vue.auth.getUserToken(),
        //         companyId: Vue.mallSettings.getCompanyId(),
        //         hotWordAmount: 10
        //     };
        //     Vue.api.get(url, param, (res) => {
        //         this.hotWord = res.data.searchHotWordList||this.hotWord;
        //     }, (res) => {
        //         Vue.api._showError(res.message);
        //     })
        // },
        //获取默认提示词
        getPlaceHoder:function(){
            "use strict";
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: config.pageCode,
                adCode: 'searchword,hotword',
                companyId: Vue.mallSettings.getCompanyId(),
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.hotWord = res.data.hotword;
                this.searchWordObj = res.data.searchword[0];
                var words = [];
                if (res.data.searchword instanceof Array && res.data.searchword.length > 0) {
                    res.data.searchword.forEach((v)=> {
                        words.push(v.content || '')
                    })
                    this.placeholder = words.join(' ');
                    $('input.search-input').attr('placeholder', words.join(' '));
                    return;
                }
                $('input.search-input').attr('placeholder', '搜索您想找的商品');
            });
        },
        //清除历史
        cleanSearchHistory: function () {
            var dialog = $.dialog({
                title: "",
                content: "清空历史数据？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    if(Vue.auth.loggedIn()) this.cleanUserHistory();
                    else {
                        Vue.localStorage.removeItem(searchHistoryKey);
                        this.historyWord = [];
                    }
                }
            });
        },
        //清除用户搜索历史
        cleanUserHistory:function(){
            "use strict";

            var url = config.apiHost + "/api/search/cleanSearchHistory";
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                ut: Vue.auth.getUserToken()
            };
            Vue.api.postForm(url, param, (res) => {
                Vue.localStorage.removeItem(searchHistoryKey);
                this.historyWord = [];
            })
        },
        //获取用户搜索历史
        getUserHistory:function(){
            "use strict";

            // var url = config.apiHost + "/api/search/searchHistoryList";
            // var param = {
            //     companyId: Vue.mallSettings.getCompanyId(),
            //     ut: Vue.auth.getUserToken(),
            //     count:10
            // };
            // Vue.api.get(url, param, (res) => {
            //     this.historyWord=[];
            //     if(res.data.searchHistoryList instanceof Array) {
            //         res.data.searchHistoryList.forEach((v)=> {
            //             this.historyWord.push(v.keyword)
            //         })
            //     }
            // })
        },
        //将keyword添加到搜索历史
        addSearchHistory: function (keyword) {
            if (!keyword||Vue.auth.loggedIn()) {
                return;
            }

            if (!this.historyWord) {
                this.historyWord = [];
            }

            var exists = false;

            this.historyWord.forEach(function (item) {
                if (item == keyword) {
                    exists = true;
                }
            });
            //不存在搜索记录
            if (!exists) {
                this.historyWord.push(keyword);
            }else{
                //如果存在,需要换个位置
                this.historyWord.push(keyword);
                this.historyWord.splice(this.historyWord.indexOf(keyword),1);
            }

            Vue.localStorage.setItem(searchHistoryKey, this.historyWord);

        },
        //设置跳转属性
        setToUrl:function(arrays){
            "use strict";
            var urlAttr=[]
            var arrays=arrays.replace(/\"/g,'').split(',')
            if(this.propertiesBak.length==0) return '';
            var attrs=JSON.parse(this.propertiesBak);
            if(attrs instanceof Array){
                attrs.forEach((v)=>{
                    var ids=[]
                    if(v.attributeValues instanceof Array){
                        v.attributeValues.forEach((V)=>{
                            if(arrays.indexOf(V.id.toString())>=0){
                                ids.push(V.id)
                            }
                        })
                    }
                    if(ids.length>0)
                        urlAttr.push(v.id+':'+ids.join('-'))
                })
            }
            return JSON.stringify(urlAttr.join()).replace(/\"/g,'');
        },
        //获取并格式化过滤属性
        getAttrJson:function(attrParam){
            "use strict";
            var attrJson={
                attributeJson:[]
            }
            this.selectedPropIdsList=[];
            if(attrParam.length>0){
                var l1=attrParam.replace(/\"/g,'').split(',');
                if(l1.length>0){
                    l1.forEach((v)=>{
                        var l2=[];
                        if(v.length>0&&v.indexOf(":")>0&&(l2=v.split(":")).length==2) {
                            var l21=[];
                            if(l2[1].split("-").length>0){
                                l2[1].split("-").forEach((v)=>{
                                    l21.push(v-0);
                                    this.selectedPropIdsList.push(v);
                                })
                            }
                            attrJson.attributeJson.push({
                                attributeId: l2[0]-0,
                                attrValueIds: l21
                            })
                        }
                    })
                }
            }
            return JSON.stringify(attrJson);
        },
        //获取搜索结果列表
        loadSearchList: function (load,flag) {
            var url = config.apiHost + '/api/search/searchList';
            var keyword = this.keyword || "*****";
            this.pageNo=load?this.pageNo:1;
            if (!load) {
                this.showNoMore = false;
            }
            this.loading=true;
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),//公司id
                shoppingGuideJson: this.getAttrJson(this.selectedPropIds),//导购属性json字符串
                brandIds: this.selectedBrandIds.join(),//品牌id
                promotionIds: this.promotionId,//促销id
                coverProvinceIds: '',//覆盖省份id
                sortType: this.sortType,//排序字段code
                filterType: '',//筛选过滤
                pageNo: this.pageNo,//当前页
                pageSize: this.pageSize,//当页显示数量
                platformId:config.platformId,
                areaCode: Vue.area.getArea().aC,
                isPointProduct:1,
                productType:this.productType,
                pointPriceRange:this.pointPriceRange
            };

            //互斥搜索条件
            if (keyword) {
                param.keyword = keyword;
            }
            if (this.categoryIds) {
                //类目id
                param.navCategoryIds = this.categoryIds;
            }
            if(flag && !keyword){
                param.keyword = '*****';
            }
            Vue.api.get(url, param, (res) => {
                if(res.data.isKeywordBrand&&res.data.keywordBrandId){
                    //如果要跳走, 行把页面重置, 防止页面死循环
                    window.history.replaceState(null, "",  '/score/score-search.html');
                    location.href='/brand/brand.html?brandIds='+res.data.keywordBrandId;
                    return;
                }
                this.loading=false;
                this.totalCount = res.data.totalCount;
                //推荐关键词
                this.zeroRecommendWord = res.data.zeroRecommendWord||'';
                //推荐结果列表
                this.zeroRecommendResult=res.data.zeroRecommendResult||[];
                //推荐关键字集
                this.maybeInterestedKeywords=res.data.maybeInterestedKeywords||[];
                //热搜词
                //this.hotWord=res.data.hotwordsRecommended||[];

                //分类
                this.isCategoryNum++;
                if(res.data.navCategoryTreeResult.length > 0) {
                    if(this.isCategoryNum == 1){
                        this.categoryTreeResult=res.data.navCategoryTreeResult[0].children||[];
                        this.categoryTreeName=res.data.navCategoryTreeResult[0].name;
                        if(this.categoryTreeResult.length == 0) this.showcategoryTreeName = true;
                        else this.showcategoryTreeName = false;
                    }

                }else{
                    this.categoryTreeResult=[];
                    this.isCategoryNum = 0;
                }

                this.initScrollX();
                //搜索返回结果为0件
                if(this.totalCount==0){
                    this.productList = [];
                    //无推荐结果
                    if(this.zeroRecommendResult.length==0){
                        this.showRecommendNotice = false;
                        this.showNotice = true;
                    }

                    //有推荐结果
                    if(this.zeroRecommendResult.length>0) {
                        this.showRecommendNotice = true;
                        this.showNotice = false;
                        // this.productList = this.zeroRecommendResult;
                        //积分实时价格
                        Vue.getPointProPriceAndStock((function (productList) {
                            "use strict";
                            var itemIds = [];
                            for (let p of productList) {
                                itemIds.push(p.mpId)
                            }
                            return itemIds.join();
                        })(this.zeroRecommendResult),this.zeroRecommendResult,null,(obj) => {
                            if (load) {
                                this.productList = this.productList.concat(obj || []);
                            } else {
                                this.productList = obj || [];
                                //如果初始请求数目小于pageSize,表示数据不足一页
                                if (res.data.totalCount < this.pageSize)
                                    this.showNoMore = true;
                            }
                        })

                        this.resizeImgHeight();
                    }

                    if(this.zeroRecommendResult.length==0 && this.maybeInterestedKeywords.length == 0 && !urlParams.promotionId){
                        // this.getPlaceHoder();
                    }
                }else {
                    if (res.data.productList) {
                        //积分实时价格
                        Vue.getPointProPriceAndStock((function (productList) {
                            "use strict";
                            var itemIds = [];
                            for (let p of productList) {
                                itemIds.push(p.mpId)
                            }
                            return itemIds.join();
                        })(res.data.productList),res.data.productList,null,(obj) => {
                            if (load) {
                                this.productList = this.productList.concat(obj || []);
                            } else {
                                this.productList = obj || [];
                                //如果初始请求数目小于pageSize,表示数据不足一页
                                if (res.data.totalCount < this.pageSize)
                                    this.showNoMore = true;
                            }
                        })
                        // if(realPriceStock)
                        //this.showNotice = false;
                        //this.showRecommendNotice = false;
                        //this.resizeImgHeight();
                        // } else {
                        //     this.showNotice = true;
                        // }
                    }
                }

                if (res.data.sortByList) {
                    this.sortByList = res.data.sortByList;
                    for(let sort of this.sortByList){
                        if(sort.sortTypeCode==this.sortType)
                            this.complexText=sort.sortTypeShort;
                    }


                } else {
                    this.sortByList = [];
                }

                //品牌列表
                if(this.brandList.length==0||JSON.stringify(this.brandList)!=JSON.stringify(res.data.brandResult)) {
                    this.brandList = res.data.brandResult || [];
                    this.brandListBak=JSON.stringify(this.brandList);
                    for(var i in this.brandList){
                        if(this.selectedBrandIds.indexOf(this.brandList[i].id.toString())>=0){
                            this.brandList[i].checked=true;
                        }
                    }
                }
                //属性列表
                if(this.properties.length==0||JSON.stringify(this.properties)!=JSON.stringify(res.data.attributeResult)) {
                    this.properties = res.data.attributeResult || [];
                    this.propertiesBak=JSON.stringify(this.properties);
                    for(var i in this.properties){
                        for(var j in this.properties[i].attributeValues)
                            if(this.selectedPropIdsList.indexOf(this.properties[i].attributeValues[j].id.toString())>=0){
                                this.properties[i].attributeValues[j].checked=true;
                                this.properties[i].exist=true;
                            }
                    }
                }

                this.resizeImgHeight();

            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        // 获取实时价格库存
        getPriceStockList:function (itemIds) {
            if((itemIds||'').length==0) return;
            var url = config.apiHost + '/api/pointMallProduct/getPriceLimitList';
            var param = {
                mpIds: itemIds,//商品ids
                promotionId: this.promotionId
            };
            Vue.api.get(url, param, (res) => {
                var plistMap={};
                for(let pl of res.data.pList||[]){
                    plistMap[pl.mpId]=pl;
                }
                for(let pl of this.productList||[]){
                    if(plistMap[pl.mpId]){
                        $.extend(pl,plistMap[pl.mpId])
                    }
                }
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //提交搜索
        submitSearch: function(key,url){
            //搜索框失去焦点
            $('#searchInput').blur();
            this.isFromSearch = true;
            this.showNotice = false;

            this.keyword = key;
            // this.keyword = key || this.placeholder;
            // if(key == '' && this.searchWordObj.linkUrl){
            //     location.href = this.searchWordObj.linkUrl;
            //     return;
            // }
            // if(!this.keyword && !url){
            if(!this.keyword){
                $.tips({
                    content: '请输入关键词',
                    stayTime: 2000,
                    type: "warn"
                });
            }else{
                //更新url
                //if (this.keyword) {
                // this.addSearchHistory(this.keyword);
                var url = '';
                if(url && url.length>0){
                    var url = url;
                }else{
                    url = "/score/score-search.html?keyword="+this.keyword;
                }
                if (hashStr) {
                    url += "#" + hashStr;
                }
                //回归初始状态
                this.currentIndex = 0;
                this.sortType=23;
                window.history.replaceState(null, "",  url);
                //}

                // this.resetAttrAndBrand();
                this.showSearchPop = false;

                setTimeout(function(){
                    window.scrollTo(0,0);
                },200)
                //搜索数据
                this.loadSearchList(false);
            }
        },

        //销量排序
        saleSort: function () {
            this.currentIndex = 1;
            this.complexText = '综合';
            this.showSequencePop = false;

            if(this.sortType == 'volume4sale_desc') return;
            else this.sortType = 'volume4sale_desc';
            this.replaceStateForSortType();
            this.loadSearchList(false);
        },
        //综合
        toComplexSort: function(){
            // if(!this.showNotice) {
                // this.showSequencePop = true;
                if(this.currentIndex == 0){
                    if(this.sortType == 23){
                        this.sortType = 24;
                    } else if(this.sortType == 24){
                        this.sortType = 23;
                    }
                } else{
                    this.currentIndex = 0;
                    this.sortType =23;
                }
                this.loadSearchList(false);
            // }
        },
        complexSort: function(sort){
            this.sortType = sort.sortTypeCode;
            this.complexText = sort.sortTypeShort;
            this.showSequencePop = false;
            this.replaceStateForSortType();
            this.loadSearchList(false);
        },
        //分类
        choseCategory: function(item){
            this.categoryIds = item.id;
            //var url=location.href;
            //url +='&categoryId='+this.categoryIds;
            //window.history.replaceState(null, "",  url);
            this.loadSearchList(false);
        },
        replaceStateForSortType:function(){
            "use strict";
            var url=location.href;
            if(url.indexOf('sortType=')>=0)
                url=url.replace(/(sortType=)(((\w|,|%)+)?|#|&)/,'$1'+this.sortType);
            else{
                if(url.indexOf('search.html?')>=0){
                    url=url.replace('search.html?','search.html?sortType='+this.sortType+'&')
                }else{
                    url=url.replace('search.html','search.html?sortType='+this.sortType)
                }
            }
            window.history.replaceState(null, "",  url);
        },
        //加入购物车
        addItemInCart: function (item) {
            var params = {ut:Vue.auth.getUserToken(),mpId: item.mpId, num: this.itemAmount, sessionId: Vue.session.getSessionId()};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop=false;
                this.itemAmount = 1;
                //刷新右下角 购物车角标数量
                this.$refs.scrolltop.getCartCount();
                if(this.promotionId) this.getCartExt();
            });
        },
        resizeImgHeight: function () {
            // Vue.nextTick(
            //     function(){
            //         var w = $('.ui-list-grid .img >img').width();
            //         $('.ui-list-grid .img >img').height(w);
            //     }
            // )
        },
        //点击返回
        clickBack: function(){
            this.keyword='';
            if(Vue.browser.isApp()) {
                Vue.app.back();
            } else {
                if(this.isFromSearch){
                    this.showSearchPop = true;
                    if (Vue.auth.loggedIn()) {
                        this.getUserHistory();
                    }
                }
                else history.back();
            }
        },

        //德升增加
        //自动补充
        autoFill:function(keyword){
            "use strict";
            let url=config.apiHost + '/api/search/auto';
            let param={
                keyword:this.keyword,
                companyId: Vue.mallSettings.getCompanyId()
            }
            Vue.api.get(url, param, (res) => {
                for(var i in res.data) {
                    var str = res.data[i].keyword;
                    if(str.indexOf(this.keyword) == 0) {
                        res.data[i].keyword = '<span class="theme">' + this.keyword + '</span>' + str.split(this.keyword)[1];
                    }else {
                        res.data[i].keyword = str.split(this.keyword)[0] + '<span class="theme">' + this.keyword + '</span>';
                    }
                }
                this.autoFillList = res.data||[];
                this.showAutoFill=true;
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //点击候选词
        clickAutoFill: function (str) {
            str = str.replace(/<\/?[^>]*>/g,''); //去除HTML tag
            str = str.replace(/[ | ]*\n/g,'\n'); //去除行尾空白
            window.location.href = config.contextPath + "/score/score-search.html?keyword=" + str;
        },
        deleteSearch:function(){
            "use strict";
            this.keyword='';
            this.autoFillShow(this.keyword)
        },
        //展示自动补充
        autoFillShow:function(keyword){
            "use strict";
            let delay=0;
            if((keyword||'').length==0) {
                if(this.timer) clearTimeout(this.timer);
                this.showAutoFill = false;
                return;
            }
            if(this.timer){
                clearTimeout(this.timer);
                delay=300;
            }
            this.timer=setTimeout(()=>{
                this.autoFill(keyword);
            },delay)
        },
        //选择某个系列属性值
        selectAttributeValue: function (serialAttribute, value) {
            serialAttribute.values.forEach(function (v) {
                v.checked = false;
            });

            value.checked = true;

            var newItemInfo = this.getSerialItemInfo();
            //选择了不同的属性
            if (newItemInfo && newItemInfo.mpId != this.itemInfo.mpId) {
                this.itemInfo = newItemInfo;
                this.updateItemPreviewImage();
            }

        },
        //获得所选的系列商品信息
        getSerialItemInfo: function () {
            if (!this.serialAttributes || this.serialAttributes.length ==0
                || !this.serialProducts || this.serialProducts.length == 0) {
                return null;
            }

            var delimiter = "_";
            var key = "";
            //收集选择的系列属性id
            for (var i = 0; i < this.serialAttributes.length; i++) {
                var values =  this.serialAttributes[i].values;

                inner:
                    for (var j = 0; j < values.length; j++) {
                        if(values[j].checked) {
                            key += delimiter + values[j].id;
                            break inner;
                        }
                    }
            }
            //_123_456_
            key += delimiter;

            var itemInfo = null;

            //根据key获取商品id
            for (var k = 0; k < this.serialProducts.length; k++) {
                var sp = this.serialProducts[k];
                if (sp.key == key) {
                    itemInfo = sp.product;
                    break;
                }
            }

            return itemInfo;
        },

        //弹出系列属性选择窗口
        alertSerialProducts:function(prod){
            "use strict";
            this.itemPreviewImage='';
            this.itemInfo={};
            this.getItemInfo(prod.mpId);
            this.getSerialProducts(prod)
        },

        //获取商品系列属性及系列商品
        getSerialProducts: function (item) {
            Vue.api.get("/api/product/serialProducts", {mpId: item.mpId,platformId:config.platformId}, (result) => {
                if (result.data) {
                    this.serialAttributes = result.data.attributes || [];
                    this.serialProducts = result.data.serialProducts || [];
                    if(this.serialProducts.length > 0) this.showSizePop=true;
                    else this.addItemInCart(item);
                    //this.updateSelectedItemInfo();
                }
            });
        },

        //商品基本信息
        getItemInfo: function (itemId) {
            Vue.api.get("/api/product/baseInfo", {mpsIds: itemId}, (result) => {
                if (result.data && result.data.length > 0) {
                    this.itemInfo = result.data[0];
                    this.updateItemPreviewImage();
                }
            });
        },

        //更新预览图
        updateItemPreviewImage: function () {
            if (this.itemInfo && this.itemInfo.pics && this.itemInfo.pics.length > 0) {
                this.itemPreviewImage = this.itemInfo.pics[0].url;
            }
        },

        //增减购物数量
        plusAmount: function (step) {
            if (this.itemSoldOut) {
                return;
            }

            var num = this.itemAmount + step;
            if (num>0 && num <= this.itemInfo.stockNum) {
                this.itemAmount = num;
            }
        },
        //立即购买
        quickPurchase: function() {
            var params = {
                ut: Vue.auth.getUserToken(),
                sessionId: Vue.session.getSessionId(),
                mpId: this.itemInfo.mpId,
                num: this.itemAmount,
                merchantId: this.itemInfo.merchantId,
                companyId: Vue.mallSettings.getCompanyId(),
                platformId: config.platformId
            };
            Vue.api.postForm("/api/checkout/quickPurchase", params, (res) => {
                //如果存在非法商品
                if (res.code != 0 && res.code != '0') {
                    this.unusualStatus = true;
                    this.unusualExecute(res.data.error);
                    return;
                }
                window.location.href = "/pay/pay.html?quickPurchase=true";
            });
        },
        //商品不正常状态处理 0 选购的商品总价发生了变化,1 商品失效或下架 2 选购的商品全部失效 提示后,直接返回购物车 3 部分商品不在销售区域内 4 所有商品都不在销售区域内
        unusualExecute: function (data) {
            "use strict";
            this.preOrderInfo = data;
            var dia, title, button, content = '';
            if (this.preOrderInfo.type == 0) {
                title = '<div class="c9 text-center">选购的商品总价发生了变化</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 1) {
                title = '<div class="c9 text-center">以下商品暂时无货!</div>';
                button = ['<span style="color:gray">返回购物车</span>', '继续结算'];
            } else if (this.preOrderInfo.type == 2) {
                title = '<div class="c9 text-center">选购商品全部无货!</div>'
                button = ['<span style="color:gray">返回购物车</span>'];
            } else if(this.preOrderInfo.type == 3){
                title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
                button = ['<span style="color:gray">删除无效商品</span>', '修改收货地址'];
            }else if(this.preOrderInfo.type == 4){
                title = '<div class="c9 text-center">'+this.preOrderInfo.message+'</div>'
                button = ['<span style="color:gray">修改收货地址</span>', '回去看看'];
            } else {
                return;
            }

            if (this.preOrderInfo.type == 0 || this.preOrderInfo.type == 1) {
                for (let item of (this.preOrderInfo.data || [])) {
                    content += '<li class="ui-border-b" style="margin:0;margin: 0;">' +
                        '<div class="ui-list-thumb">' +
                        '<img src="' + item.imgUrl + '" width="60" height="60"></div>' +
                        '<div class="ui-list-info">' +
                        '<p class="name ui-nowrap-multi">' + item.name + '</p></div></li>';
                }
            }
            content = '<ul class="ui-list ui-list-customize" style="background:none;overflow: auto;max-height: 200px;">' + content + '</ul>';

            dia = $.dialog({
                title: title,
                content: content,
                button: button
            });

            dia.on("dialog:action", (e)=> {
                if (e.index == 0)
                    location.href = '/cart.html';
                else {
                    this.getOrder(null, null, true);
                }
            });
        },

        //筛选相关
        //打开筛选框
        openFilter:function(){
            "use strict";
            this.showFilter=true;
            this.showSequencePop=false;
        },
        //选择全部属性
        selectAll:function(id){
            $('#'+id).addClass('ui-sift-lable-active');
            $('#' + id).parent().siblings().find('span').removeClass('ui-sift-lable-active');
        },
        //选择单个属性
        selectSingle:function(id,pid){
            $('#'+pid).removeClass('ui-sift-lable-active');
            if($('#'+id).hasClass('ui-sift-lable-active')) {
                $('#' + id).removeClass('ui-sift-lable-active');
                var num = 0;
                $('#' + id).parent().siblings().find('span').each(
                    function () {
                        if($(this).hasClass('ui-sift-lable-active')) return;
                        else num++;
                    }
                );
                if(num == $('#' + id).parent().siblings().find('span').length) $('#'+pid).addClass('ui-sift-lable-active');
            }
            else
                $('#'+id).addClass('ui-sift-lable-active');
        },
        //重置
        resetAttrAndBrand:function(){
            this.pointRange.forEach((item) => {
                item.check = false;
            })
            this.selectedPointRange = {
                "text":'不限',
                "value":'0',
                "check":true
            };
            this.pointRange.forEach((item) => {
                if(item.text == '不限'){
                    Vue.set(item,'check',true);
                }
            });
            this.pointPriceRange = 0;
            // this.showSequencePop=true;
        },
        //确定选择
        submitAllSelection:function() {
            this.productList = [];
            this.loadSearchList(false);
            this.showFilter=false;
        },
        dropdownProp:function(e,id){
            if($(e.target).text()=='全部') {
                $(e.target).text('收起').siblings().removeClass('icons2-arrow-b').addClass('icons2-arrow-t');
                $('#'+id).parent().siblings().filter('.gt2').show();
            }else {
                $(e.target).text('全部').siblings().removeClass('icons2-arrow-t').addClass('icons2-arrow-b');
                $('#'+id).parent().siblings().filter('.gt2').hide();
            }
        },
        //统计所有促销标签
        formatPromotionText:function(prod){
            "use strict";
            var iconText=[];
            if(prod.promotionInfo instanceof Array&&prod.promotionInfo.length>0){
                if(prod.promotionInfo[0].promotions instanceof Array&&prod.promotionInfo[0].promotions.length>0){
                    prod.promotionInfo[0].promotions.forEach((v)=>{
                        iconText.push(v.iconText);
                    })
                }
            };
            // return (prod.promotionIconTexts||[]).concat(iconText);
            return iconText;
        },
        //购物车活动促销信息
        getCartExt: function() {
            var params = {
                ut: Vue.auth.getUserToken(),
                sessionId: Vue.session.getSessionId(),
                companyId: Vue.mallSettings.getCompanyId(),
                promotionId: this.promotionId,
            };
            Vue.api.get("/api/cart/ext", params, (res) => {
                this.cartExt = res.data;
                this.initScrollX1();
            });
        },
        //促销信息
        getPromotionDetail: function () {
            var params = {
                promotionId: this.promotionId,
                platformId: config.platformId
            };
            Vue.api.get("/api/product/promotionDetail", params, (res) => {
                this.promotionDetail = res.data;
                this.initScrollX1();
            });
        },
        stopPropagation: function (e) {
            e.stopPropagation();
        },
        //初始化横向滚动
        initScrollX: function () {
            Vue.nextTick(function () {
                $('.ui-list-category').each(function (i, el) {
                    new fz.Scroll(el, {
                        scrollY: false,
                        scrollX: true
                    });
                });
            });
        },
        initScrollX1: function () {
            Vue.nextTick(function () {
                $('.ui-scroller').each(function (i, el) {
                    new fz.Scroll(el, {
                        scrollY: false,
                        scrollX: true,
                        //momentum: false
                    });
                });
            });
            Vue.nextTick(function () {
                $('.ui-scroller1').each(function (i, el) {
                    new fz.Scroll(el, {
                        scrollY: false,
                        scrollX: true,
                        //momentum: false
                    });
                });
            });
        },
        //重定向
        gotoCart:function(){
            "use strict";
            if(Vue.browser.isApp()){
                location.href = '${appSchema}://shoppingCar'
            }else{
                location.href = '/cart.html'
            }
        },
        gotoDetail:function(prod){
            "use strict";
            if(Vue.browser.isApp()){
                location.href = '${appSchema}://productdetail?body={"mpId":'+prod.mpId+'}';
            }else{
                location.href = '/detail.html?isPointPro=1&itemId='+prod.mpId;
            }
        },
    },
    computed: {
        //商品已售完
        itemSoldOut: function () {
            return !this.itemInfo || !this.itemInfo.stockNum;
        },
        showPop:function(){
            "use strict";
            return this.showSequencePop||this.showSizePop;
        }
    },
    watch:{
        keyword:function(val){
            "use strict";
            if((val||'').length==0)
                this.showAutoFill = false;
            else
                this.showAutoFill = true;
        }
    }
});
vm.$watch('showSearchPop',function(v){
    if(v){
        //显示搜索弹层
        $('#searchInput').focus();
        //初始化热搜词
        //this.searchHotWord();
        //获取屏幕高度
        var h = $(window).height();
        $('html,body').css('height',h);
    }
});