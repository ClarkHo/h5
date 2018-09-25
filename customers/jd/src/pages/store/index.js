import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import config from "../../config/default.js";

import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload, {
    loading: config.defaultImg
});

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiActionsheetPop
    },
    data: {
        showSequencePop: false, //综合弹层
        currentIndex: 0, //以哪种方式排序(选中标红)
        showFilter: false,
        complexText: '综合', //默认综合
        sortType: 10, //排序方式(默认综合)
        showGrid: true, //默认显示九宫格
        categoryIds: '', //类目id
        pageNo: 1, //当前页
        pageNo_n: 1,
        pageNo_p: 1,
        pageSize: 20, //当页显示数量
        totalCount: 0, //商品总数
        showNotice: false,
        allProductTotal: '',
        sortByList: [], //排序列表
        sortT: 1, //1表示综合，2表示销量排序，用来做切换判断
        allProductList: [],
        newProductTotal: '',
        newProductList: [],
        promotionTotal: '',
        promotionList: [], //店铺活动
        keyword: '', //关键词
        showSearch: 1,
        current: '',
        indexInfo: '',
        prices: {
            from: '',
            to: ''
        },
        attrs:null,//保存筛选条件 
        rightNavFlag: false,
        merchantId: urlParams.merchantId,
        shopInfo: {},
        isFavorite: false, //用户是否关注店铺
        ut: Vue.auth.getUserToken(),
        properties:[],
        propertiesBak:[],
        adImgList:[
            {
                src:'${staticPath}/images/store-1.png'
            },
            {
                src:'${staticPath}/images/store-2.png'
            },
            {
                src:'${staticPath}/images/store-2.png'
            },
        ],
        productList:[
            {src:'${staticPath}/images/store-3.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画配电箱免打孔遮罩后面很多很多字',price:158},
            {src:'${staticPath}/images/store-4.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画现代的什么什么的面很多很多字',price:178},
            {src:'${staticPath}/images/store-3.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画配电箱免打孔遮罩后面很多很多字',price:158},
            {src:'${staticPath}/images/store-4.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画现代的什么什么的面很多很多字',price:178},
            {src:'${staticPath}/images/store-3.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画配电箱免打孔遮罩后面很多很多字',price:158},
            {src:'${staticPath}/images/store-4.png',name:'一杨 电表箱装饰画北欧式风格客厅挂画现代的什么什么的面很多很多字',price:178},
        ]
    },
    created() {
        this.getIndex();
        this.getShopInfo()
    },
    ready: function () {
        switch (urlParams.current) {
            case "index":
            case "all":
                this.getAllProductList();
            case "new":
                this.getNewProductList();
            case "activity":
                this.getPromotion();
                this.current = urlParams.current || 'all';
                break;
            default:
                this.current = 'all';
                this.getAllProductList();
                break;
        }
        if(this.ut){
            this.getfavorite();
        }
        // this.getAllProductList();
        // this.getNewProductList();

        //滚动加载更多数据
        Vue.scrollLoading({
            parentEl: '#product-wrappers',
            childEl: '#product-wrapper',
            callback: () => {
                switch (this.current) {
                    case 'all':
                        if (!this.showSequencePop && this.totalCount > this.allProductList.length) {
                            this.pageNo += 1;
                            this.getSearchList(this.sortType)
                        }
                        break;
                    case 'new':
                        if (this.newProductTotal > this.newProductList.length) {
                            this.pageNo_n += 1;
                            this.getNewProductList()
                        }
                        break;
                    case 'activity':
                        if (this.promotionTotal > this.promotionList.length) {
                            this.pageNo_p += 1;
                            this.getPromotion()
                        }
                        break;
                }

            }
        });
    },
    methods: {
        getfavorite: function (params) {
            var url = '/ouser-center/api/favorite/check.do';
            var params = {
                ut:this.ut,
                type: 3,
                entityId: this.merchantId
            }
            Vue.api.postForm(url, params, (res) => {
                this.isFavorite = res.isFavorite;
            })
        },
        switchGrid: function () {
            this.showGrid = !this.showGrid;

            Vue.nextTick(() => {
                this.resizeImgHeight();
                this.$Lazyload.lazyLoadHandler();
            })
        },
        //销量排序
        saleSort: function () {
            this.currentIndex = 1;
            this.complexText = '综合';
            this.showSequencePop = false;

            if (this.sortType == 'volume4sale_desc') return;
            else this.sortType = 'volume4sale_desc';
            this.pageNo = 1;
            this.getSearchList(this.sortType,'',true);
        },
        // 是否有首页
        getIndex: function () {
            var url = '/cms/page/getMerIndexPage';
            var param = {
                merchantId: this.merchantId
            }
            Vue.api.get(url, param, (res) => {
                this.indexInfo = res.data;
            })
        },
        back: function () {
            if (Vue.browser.isApp()) {
                Vue.app.back();
            } else {
                history.back();
            }
        },
        switchTab: function (str) {
            if (!str) return;
            if (this.current == str) return;
            this.current = str;
            switch (this.current) {
                case "index":
                    break;
                case "all":
                    this.pageNo = 1;
                    this.getAllProductList();
                    break;;
                case "new":
                    this.pageNo_n = 1;
                    this.getNewProductList(true);
                    break;
                case "activity":
                    this.pageNo_p = 1;
                    this.getPromotion(true);
                    break;
                    break;
            }
            var url = location.pathname;
            if (str) {
                url += url.indexOf('?') > 0 ? '&current=' + str : '?current=' + str;
            }
            window.history.replaceState(null, "", url);
        },
        //全部商品
        getAllProductList: function () {
            this.getSearchList('','',true)
        },
        //上新商品
        getNewProductList: function (flag) {
            // if (this.current == 'new' ) {
            //     return
            // }
            var params = {
                merchantId: this.merchantId,
                // ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),
                coverProvinceIds: '', //覆盖省份id
                sortType: '', //排序字段code 12新品
                filterType: 'IS_NEW', //筛选过滤
                priceRange: '', //价格区间
                pageNo: this.pageNo_n, //当前页
                pageSize: this.pageSize, //当页显示数量
                platformId: config.platformId,
                areaCode: Vue.area.getArea().aC,
            };

            Vue.api.get("/api/search/searchList", params, (result) => {
                if (result.data) {
                    if (result.data.productList) {
                        if(flag){
                            this.newProductList = result.data.productList;
                        } else{
                            this.newProductList = this.newProductList.concat(result.data.productList);
                        }
                    }
                    this.newProductTotal = result.data.totalCount;
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        getSearchList: function (sortType = '', price = '',flag) {
            var params = {
                merchantId: this.merchantId,
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(), //公司id
                coverProvinceIds: '', //覆盖省份id
                sortType: sortType, //排序字段code
                filterType: '', //筛选过滤
                priceRange: price, //价格区间
                pageNo: this.pageNo, //当前页
                pageSize: this.pageSize, //当页显示数量
                platformId: config.platformId,
                areaCode: Vue.area.getArea().aC,
            };

            if(this.attrs!=null){
                params.shoppingGuideJson = JSON.stringify({
                    attributeJson:this.attrs
                })
            }

            Vue.api.get("/api/search/searchList", params, (result) => {
                if (result.data) {
                    if (result.data.productList) {
                        if (flag) {
                            this.allProductList = result.data.productList;
                        } else {
                            this.allProductList = this.allProductList.concat(result.data.productList);
                        }
                    }
                    this.properties = result.data.attributeResult || [];
                    this.propertiesBak=JSON.stringify(this.properties);
                    this.sortByList = result.data.sortByList;
                    this.allProductTotal = result.data.totalCount;
                    this.totalCount = result.data.totalCount;
                }
            }, () => {
                //处理掉不显示报错
            });
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
        dropdownProp:function(e,id){
            if($(e.target).text()=='全部') {
                $(e.target).text('收起').siblings().removeClass('icons2-arrow-b').addClass('icons2-arrow-t');
                $('#'+id).parent().siblings().filter('.gt2').show();
            }else {
                $(e.target).text('全部').siblings().removeClass('icons2-arrow-t').addClass('icons2-arrow-b');
                $('#'+id).parent().siblings().filter('.gt2').hide();
            }
        },
        //店铺活动信息
        getPromotion: function (flag) {
            var params = {
                merchantId: this.merchantId,
                platformId: config.platformId,
                promotionTypeList: '2,3,4',
                currentPage: this.pageNo_p,
                itemsPerPage: this.pageSize
            };
            Vue.api.get("/api/promotion/merchantPromotionList", params, (result) => {
                if (result.data) {
                    if (flag) {
                        this.promotionList = result.data.listObj;
                    } else{ 
                        this.promotionList = this.promotionList.concat(result.data.listObj);
                    }
                    this.promotionTotal = result.data.total;
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //去对应的店铺活动
        goPromotion: function (pid) {
            if (!pid) {
                return
            }
            let url = `/store/search.html?promotionId=${pid}`;
            return url;
        },
        //店铺基本信息
        getShopInfo: function () {
            return;
            let url = `/back-merchant-web/shop/baseInfo.do`
            let params = {
                merchantId: this.merchantId,
            }
            Vue.api.get(url, params, (result) => {
                this.shopInfo = result.data;
            });
        },
        goSearch: function () {
            // if(this.keyword){
            //     return;
            // }
            window.location.href = '/store/search.html?merchantId='+ this.merchantId + '&keyword=' + this.keyword;
        },
        //综合
        toComplexSort: function () {
            if (!this.showNotice) {
                this.showSequencePop = true;
                this.currentIndex = 0;
            }
        },
        complexSort: function (sort) {
            this.sortType = sort.sortTypeCode;
            this.complexText = sort.sortTypeShort;
            this.showSequencePop = false;
            this.pageNo = 1;
            this.getSearchList(this.sortType,'',true);
        },
        //分类
        choseCategory: function (item) {
            this.categoryIds = item.id;
            // this.loadSearchList(false);
        },
        replaceStateForSortType: function () {
            "use strict";
            var url = location.href;
            if (url.indexOf('sortType=') >= 0)
                url = url.replace(/(sortType=)(((\w|,|%)+)?|#|&)/, '$1' + this.sortType);
            else {
                if (url.indexOf('search.html?') >= 0) {
                    url = url.replace('search.html?', 'search.html?sortType=' + this.sortType + '&')
                } else {
                    url = url.replace('search.html', 'search.html?sortType=' + this.sortType)
                }
            }
            window.history.replaceState(null, "", url);
        },
        //加入购物车
        addItemInCart: function (mpid) {
            var params = {
                ut: Vue.auth.getUserToken(),
                mpId: mpid,
                num: 1,
                sessionId: Vue.session.getSessionId()
            };
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                $.tips({
                    content: "添加成功",
                    stayTime: 2000,
                    type: "success"
                });
                //添加购物车埋点
                TDH5SDK.iap.addItem({
                    "id": item.mpId,
                    "name": item.name,
                    "category": item.categoryName,
                    "unitPrice": item.price,
                    "count": this.itemAmount
                })
            });
        },
        //筛选相关
        //打开筛选框
        openFilter: function () {
            "use strict";
            this.showFilter = true;
            this.showSequencePop = false;
        },
        //重置
        resetAttrAndBrand: function () {
            this.properties=[];
            this.selectedPropIds=[];
            this.prices.from='';
            this.prices.to='';
            this.attrs = null;
            //初始状态有品牌,把全部去掉
            // if(this.selectedBrandIds.length>0){
            //     $('#b_0000').removeClass('ui-sift-lable-active');
            // }
            if(this.propertiesBak)
                this.properties=JSON.parse(this.propertiesBak);
        },
        //确定选择
        submitAllSelection: function () {
            if (this.prices.from && !/^\d+(\.\d+)?$/.test(this.prices.from)) {
                $.tips({
                    content: '最低价输入有误',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if (this.prices.to && !/^\d+(\.\d+)?$/.test(this.prices.to)) {
                $.tips({
                    content: '最高价输入有误',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            
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
            if (this.prices.from > this.prices.to) {
                [this.price.from, this.prices.to] = [this.prices.to, this.price.from]
            }
            //跳转
            // var url = "/store/search.html?filter=1" +
            //     (this.prices.from.length>0||this.prices.to.length>0?"&price=" + this.prices.from + ',' + this.prices.to :'')+
            //     //(selectedPropIds.length>0?"&attrValueIds=" + selectedPropIds:'') +
            //     (selectedPropIds.length>0?("&attrValueIds=" + this.setToUrl(JSON.stringify(selectedPropIds))):'') +
            //     (selectedBrandIds.length>0?"&brandIds=" + selectedBrandIds:'');
            this.attrs = this.setToUrl(JSON.stringify(selectedPropIds));

            let prices = [parseFloat(this.prices.from) || 0, parseFloat(this.prices.to) || 0];
            if (prices[0] == '' && prices[1] == '') prices = [];

            this.getSearchList(this.sortType,prices.join(),true);
            
            // this.getSearchList(this.sortType, prices.join(),true)
            this.showFilter = false;

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
                        // urlAttr.push(v.id+':'+ids.join('-'))
                        urlAttr.push({
                            "attributeId":v.id,
                            "attrValueIds":ids
                        })
                })
            }
            return urlAttr;
        },
        resizeImgHeight: function () {
            Vue.nextTick(
                function () {
                    var w = $('.ui-list-grid .img >img').width();
                    $('.ui-list-grid .img >img').height(w);
                }
            )
        },
        // 如果是APP,跳APP详情页
        gotoDetail: function (mpId) {
            "use strict";
            if (Vue.browser.isApp()) {
                document.location = 'lyf://productdetail?body={"mpId":' + mpId + '}'
            } else {
                document.location.href = '/detail.html?itemId=' + mpId
            }
        },
        //是否收藏
        isFavorite: function () {
            let param = {}
            let url = config.apiHost + "";
            Vue.api.post(url, param, (result) => {

            })
        },
        //收藏
        addFavorite: function () {
            Vue.utils.goLogin();
            let param = {
                ut: Vue.auth.getUserToken(),
                type: '3',
                entityId: this.merchantId
            }
            let url = config.apiHost + "/ouser-center/api/favorite/add.do";
            Vue.api.postForm(url, param, (result) => {
                Vue.utils.showTips('收藏成功');
                this.getfavorite();
                this.getShopInfo();
            })

        },
        //取消
        delFavorite: function () {
            let param = {
                ut: Vue.auth.getUserToken(),
                type: '3',
                entityId: this.merchantId
            }
            let url = config.apiHost + "/ouser-center/api/favorite/delete.do";
            Vue.api.postForm(url, param, (result) => {
                Vue.utils.showTips('取消收藏成功');
                this.getfavorite();
                this.getShopInfo();
            })

        },
        goback: function () {
            if (Vue.browser.isApp()) {
                Vue.app.postMessage('webViewBack');
            } else {
                history.back();
            }
        }
    },
    filters: {
        countFliter: function (num) {
            if (num > 9999) {
                var _value = (Math.floor((num * 10) / 10000) / 10).toFixed(1);
                return `${_value}万`
            } else {
                return num
            }
        }
    }
});