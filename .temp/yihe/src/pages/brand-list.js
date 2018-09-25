import Vue from "vue";
import UiScrollTop from "../components/ui-scroll-top.vue";
import UiActionsheetPop from "../components/ui-actionsheet-pop.vue";
import config from "../../env/config.js";
import UiHeader from "../components/ui-header.vue";
import UiShare from "../components/ui-share.vue";
// import VueTouch from "vue-touch";
// Vue.use(VueTouch);

const searchHistoryKey = "searchHistory";
var vm = new Vue({
    el: 'body',
    components: {UiScrollTop,UiActionsheetPop,UiHeader,UiShare},
    data: {
        showScrollToTop: false,//返回顶部标识
        showSequencePop: false,//综合排序弹层
        showGrid: true,//默认显示九宫格
        //saleFlag: true,//销量排序标识
        currentIndex: 0,//以哪种方式排序(选中标红)
        complexText: '综合排序',//默认综合排序
        showNotice: false,
        showNoMore: false,
        showPages:false,
        showFilter:false,
        showAutoFill:true, //显示自动填充

        productList: [],//商品列表
        sortByList: [],//排序列表
        sortType: 10,//排序方式(默认综合排序)
        categoryIds: '',//类目id
        brandIds: '',
        pageNo: 1,//当前页
        pageSize: 10,//当页显示数量
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
        maybeInterestedKeywords:[], //推荐关键字数组
        prices:{
            from:'',
            to:''
        },
        priceRange: '',
        brandList:[],//品牌列表
        brandListBak:'',//品牌列表备份
        showAllBrands:false, //显示所有品牌
        properties:[], //各属性列表
        propertiesBak:'',//各属性列表备份
        selectedPropIds:[],
        selectedBrandIds:[],
        showShare: false,    //显示分享
        shareConfig: {} //分享配置

    },
    ready: function() {
        //获取url 参数 根据类目id或者关键词查找结果
        let urlParams = Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
        if (urlParams.brandIds) {
           this.brandIds = urlParams.brandIds;
        }
        if(urlParams.price){
            this.priceRange = urlParams.price;
            this.prices.from=urlParams.price.split(',')[0]||'';
            this.prices.to=urlParams.price.split(',')[1]||'';
        }
        if(urlParams.attrValueIds){
            this.selectedPropIds=urlParams.attrValueIds.split(',');
        }
        if(urlParams.brandIds){
            this.selectedBrandIds=urlParams.brandIds.split(',');
        }
        this.loadSearchList(false);

        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if (this.productList.length < this.totalCount) {
                this.pageNo += 1;
                this.loadSearchList(true);
                this.showPages = true;
            }else if(this.productList.length == this.totalCount){
                this.showNoMore = true;
            }
        });

    },
    methods: {
        //获取品牌结果列表
        loadSearchList: function (load) {
            var url = "" + '/api/search/searchList';
            var param = {
                //keyword: this.keyword,//搜索关键字
                // companyId: Vue.mallSettings.getCompanyId(),//公司id
                navCategoryIds: this.categoryIds,//类目id
                attrValueIds: '',//导购属性id
                //shoppingGuideJson: {},//导购属性json字符串
                brandIds: this.brandIds,//品牌id
                coverProvinceIds: '',//覆盖省份id
                sortType: this.sortType,//排序字段code
                filterType: '',//筛选过滤
                priceRange: this.priceRange,//价格区间
                pageNo: this.pageNo,//当前页
                pageSize: this.pageSize,//当页显示数量
            };
            Vue.api.get(url, param, (res) => {
                this.totalCount = res.data.totalCount;
                //推荐关键词
                this.zeroRecommendWord = res.data.zeroRecommendWord||'';
                //推荐结果列表
                this.zeroRecommendResult=res.data.zeroRecommendResult||[];
                //推荐关键字集
                this.maybeInterestedKeywords=res.data.maybeInterestedKeywords||[];
                //搜索返回结果为0件
                if(this.totalCount==0){
                    //无任何关键字(集)推荐
                    if(this.zeroRecommendWord.length==0&&this.maybeInterestedKeywords.length==0)
                        this.showNotice = true;
                    //有推荐结果
                    if(this.zeroRecommendResult.length>0)
                        this.productList=this.zeroRecommendResult;
                }else {
                    if (res.data.sortByList) {
                        this.sortByList = res.data.sortByList;
                    } else {
                        this.sortByList = [];
                    }
                    if (res.data.productList) {
                        if (load) {
                            this.productList = this.productList.concat(res.data.productList);
                        } else {
                            this.productList = res.data.productList;
                        }
                        this.showNotice = false;
                        this.resizeImgHeight();
                    } else {
                        this.productList = [];
                        this.showNotice = true;
                    }
                    //品牌列表
                    if(this.brandList.length==0) {
                        this.brandList = res.data.brandResult || [];
                        for(var i in this.brandList){
                            if(this.selectedBrandIds.indexOf(this.brandList[i].id.toString())>=0){
                                this.brandList[i].checked=true;
                            }
                        }
                        this.brandListBak=JSON.stringify(this.brandList);
                    }
                    //属性列表
                    if(this.properties.length==0) {
                        this.properties = res.data.attributeResult || [];
                        for(var i in this.properties){
                            for(var j in this.properties[i].attributeValues)
                                if(this.selectedPropIds.indexOf(this.properties[i].attributeValues[j].id.toString())>=0){
                                    this.properties[i].attributeValues[j].checked=true;
                                    this.properties[i].exist=true;
                                }
                        }
                        this.propertiesBak=JSON.stringify(this.properties);
                    }
                }
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //销量排序
        saleSort: function () {
            this.currentIndex = 1;
            this.complexText = '综合排序';
            this.showSequencePop = false;
            if(this.sortType == 'volume4sale_desc') return;
            else this.sortType = 'volume4sale_desc';
            this.loadSearchList(false);
        },
        //综合排序
        toComplexSort: function(){
            this.showSequencePop = true;
            this.currentIndex = 0;
        },
        complexSort: function(sort){
            this.sortType = sort.sortTypeCode;
            this.complexText = sort.sortTypeDesc;
            this.showSequencePop = false;
            this.loadSearchList(false);
        },

        //加入购物车
        addItemInCart: function (itemId) {
            var params = {mpId: itemId, num: this.itemAmount, sessionId: Vue.session.getSessionId()};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content:"添加成功",
                    stayTime:2000,
                    type:"success"
                });
                this.showSizePop=false;
            });
        },
        resizeImgHeight: function () {
            Vue.nextTick(
                function(){
                    var w = $('.ui-list-grid .img img').width();
                    $('.ui-list-grid .img img').height(w);
                }
            )
        },
        //点击返回
        clickBack: function(){
            if(this.showSearchPop)
                this.showSearchPop=false;
            else
                history.back();
        },

        //德升增加
        //自动补充
        autoFill:function(keyword){
            "use strict";
            let url="" + '/api/search/auto';
            let param={
                keyword:this.keyword,
                companyId: Vue.mallSettings.getCompanyId()
            }
            Vue.api.get(url, param, (res) => {
                this.autoFillList = res.data||[];
                this.showAutoFill=true;
            }, (res) => {
                Vue.api._showError(res.message);
            })
        },
        //展示自动补充
        autoFillShow:function(keyword){
            "use strict";
            let delay=0;
            if((keyword||'').length==0) {
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
            this.getSerialProducts(prod.mpId)
        },

        //获取商品系列属性及系列商品
        getSerialProducts: function (itemId) {
            Vue.api.get("/api/product/serialProducts", {mpId: itemId,platformId:config.platformId}, (result) => {
                if (result.data) {
                    this.serialAttributes = result.data.attributes || [];
                    this.serialProducts = result.data.serialProducts || [];
                    this.showSizePop=true;
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
                ut: ut,
                sessionId: Vue.session.getSessionId(),
                mpId: this.itemInfo.mpId,
                num: this.itemAmount,
                merchantId: this.itemInfo.merchantId,
                companyId: Vue.mallSettings.getCompanyId(),
                platformId: config.platformId
            };

            Vue.api.postForm("/api/checkout/quickPurchase", params, (res) => {
                window.location.href = "/pay/pay.html?quickPurchase=true";
            });
        },

        //筛选相关
        //选择全部属性
        selectAll:function(id){
            $('#'+id).addClass('ui-sift-lable-active');
            $('#' + id).parent().siblings().find('span').removeClass('ui-sift-lable-active');
        },
        //选择单个属性
        selectSingle:function(id,pid){
            $('#'+pid).removeClass('ui-sift-lable-active');
            if($('#'+id).hasClass('ui-sift-lable-active'))
                $('#'+id).removeClass('ui-sift-lable-active');
            else
                $('#'+id).addClass('ui-sift-lable-active');
        },
        //重置
        resetAttrAndBrand:function(){
            this.brandList=[];
            this.properties=[];
            this.selectedPropIds=[];
            this.selectedBrandIds=[];
            var urlParams=Vue.utils.paramsFormat(decodeURIComponent(window.location.href));
            if(urlParams.price){
                this.prices.from=urlParams.price.split(',')[0]||'';
                this.prices.to=urlParams.price.split(',')[1]||'';
            }
            if(urlParams.attrValueIds){
                this.selectedPropIds=urlParams.attrValueIds.split(',');
            }
            if(urlParams.brandIds){
                this.selectedBrandIds=urlParams.brandIds.split(',');
            }
            //初始状态有品牌,把全部去掉
            if(this.selectedBrandIds.length>0){
                $('#b_0000').removeClass('ui-sift-lable-active');
            }
            this.brandList=JSON.parse(this.brandListBak);
            this.properties=JSON.parse(this.propertiesBak);


        },
        //确定选择
        submitAllSelection:function() {
            var ids1 = [], ids2 = [], selectedPropIds, selectedBrandIds;
            for (var i = 0; i < $('.select-prop .ui-sift-lable-active').length; i++) {
                ids1.push($('.select-prop .ui-sift-lable-active')[i].id.split('_').pop());
            }
            selectedPropIds = ids1.join(',')

            for (var j = 0; j < $('.select-brand .ui-sift-lable-active').length; j++) {
                ids2.push($('.select-brand .ui-sift-lable-active')[j].id.split('_').pop());
            }
            selectedBrandIds = ids2.join(',')

            //如果两个价格大小相反,需要调换
            if(this.prices.from.length>0 && this.prices.to.length>0 && parseFloat(this.prices.from)>parseFloat(this.prices.to)){
                var temp=this.prices.from;
                this.prices.from=this.prices.to;
                this.prices.to=temp;
            }
            //跳转
            location.href = "/brand-list.html?"+
                (this.prices.from.length>0||this.prices.to.length>0?"&price=" + this.prices.from + ',' + this.prices.to :'')+
                (selectedPropIds.length>0?"&attrValueIds=" + selectedPropIds:'') +
                (selectedBrandIds.length>0?"&brandIds=" + selectedBrandIds:'')
        },
        dropdownProp:function(e,id){
            if($(e.target).text()=='展开') {
                $(e.target).text('收起').siblings().removeClass('icons2-arrow-b').addClass('icons2-arrow-t');
                $('#'+id).parent().siblings().filter('.gt2').show();
            }else {
                $(e.target).text('展开').siblings().removeClass('icons2-arrow-t').addClass('icons2-arrow-b');
                $('#'+id).parent().siblings().filter('.gt2').hide();
            }
        },
        //点击分享
        clickShare: function () {
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取自家did
                var from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
                return;
            }
            //获取分享信息
            var url = "" + '/api/share/shareInfo';
            var param = {
                type: 3,
                ut: Vue.auth.getUserToken(),
                paramId: this.brandIds
            };
            Vue.api.get(url, param, (res) => {
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                this.showShare = true;
            });
        }
    },
    computed: {
        //商品已售完
        itemSoldOut: function () {
            return !this.itemInfo || !this.itemInfo.stockNum;
        }
    },
    watch:{
        showSizePop:function(v){
            if(v)
                $('body').css('overflow','hidden');
            else
                $('body').css('overflow','auto');
        }
    }
});
vm.$refs.scrolltop.init();