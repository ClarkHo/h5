import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);
let hashParams = Vue.utils.hashFormat(window.location.href);
let hashStr = $.param(hashParams);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        parentCategories:[],
        currentCategoryId:'',
        subCategoryCache:[],
        childrenCategories:[],
        pageNo:1,
        pageSize:10,
    },
    ready:function (params) {
        this.getParentCategories();
        Vue.scrollLoading({
            parentEl: '#product-wrappers',
            childEl: '#product-wrapper',
            triggerHeight:50,
            callback: () => {
                if(this.switchFlag){
                    this.switchFlag = false;
                    return;
                }
                if(!this.subCategoryCache[this.currentCategoryId].isEnd){
                    this.pageNo +=1;
                    this.scrollLoading();
                }
            }
        });
    },
    methods:{
        getParentCategories: function () {
            var params = {parentId: 0, level: 1, companyId: Vue.mallSettings.getCompanyId(),pageType:5};
            Vue.api.get("/api/category/list", params, (result) => {
                if(result.data && result.data.categorys){
                    this.parentCategories = result.data.categorys;
                    this.initScrollYL();
                    //默认显示推荐
                    if (this.parentCategories.length > 0) {
                        if (!this.currentCategoryId){
                            //this.getRecommend(); 默认推荐
                            this.currentCategoryId = this.parentCategories[0].categoryId;
                            this.getChildrenCategories(this.currentCategoryId);
                        }else{
                            this.getChildrenCategories(this.currentCategoryId);
                        }
                    }
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //获取二三级分类,flag标识是否是初始化，还是切换tab
        getChildrenCategories: function (parentId) {
            this.currentCategoryId = parentId;
            var url = "/score/score-category.html?categoryId="+ parentId;
            if (hashStr) {
                url += "#" + hashStr;
            }
            //更新url
            window.history.replaceState(null, "",  url);

            //优先使用cahce的数据
            if (this.subCategoryCache[parentId]) {
                this.childrenCategories = [];
                setTimeout(() =>  {
                    this.childrenCategories = this.subCategoryCache[parentId].dataArray;
                }, 100);
                this.pageNo = this.subCategoryCache[parentId].pageNo;
                this.initScrollYR();
                return;
            } else{
                this.pageNo = 1;
                this.childrenCategories = [];
            }
            var params = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),//公司id
                pageNo: this.pageNo,//当前页
                pageSize: this.pageSize,//当页显示数量
                platformId:config.platformId,
                areaCode: Vue.area.getArea().aC,
                navCategoryIds:this.currentCategoryId,
                isPointProduct:1
            };
            Vue.api.get(config.apiHost + '/api/search/searchList', params, (result) => {

                if(result.data && result.data.productList){
                    var mpIds = [];
                    result.data.productList.forEach((item) => {
                        item.num = 0;
                        mpIds.push(item.mpId);
                    });
                    if(result.data.productList.length == 0){
                        this.childrenCategories = [];
                        this.subCategoryCache[parentId] = {
                            "pageNo":1,
                            "dataArray":this.childrenCategories,
                            "isEnd":true
                        };
                    }
                    Vue.getPointProPriceAndStock(mpIds.join(),result.data.productList,null,(obj) => {
                        this.childrenCategories = obj;
                        //cache
                        this.subCategoryCache[parentId] = {
                            "pageNo":1,
                            "dataArray":this.childrenCategories,
                            "isEnd":false
                        };
                        // Vue.set(this.subCategoryCache[parentId],'pageNo',1);
                        // Vue.set(this.subCategoryCache[parentId],'dataArray',this.childrenCategories);
                        this.resizeImgHeight();
                    })
                } else{
                    this.subCategoryCache[parentId] = {
                        "isEnd":false
                    };
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //滚动加载
        scrollLoading:function () {
            var params = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),//公司id
                pageNo: this.pageNo,//当前页
                pageSize: this.pageSize,//当页显示数量
                platformId:config.platformId,
                areaCode: Vue.area.getArea().aC,
                navCategoryIds:this.currentCategoryId,
                isPointProduct:1,//只查积分商品
            };
            Vue.api.get(config.apiHost + '/api/search/searchList', params, (result) => {

                if(result.data && result.data.productList){
                    var mpIds = [];
                    result.data.productList.forEach((item) => {
                        item.num = 0;
                        mpIds.push(item.mpId);
                    });
                    Vue.getPointProPriceAndStock(mpIds.join(),result.data.productList,null,(obj) => {
                        this.childrenCategories = this.childrenCategories.concat(obj || []);
                        //cache
                        var flag = result.data.productList.length < this.pageSize?true:false;
                        this.subCategoryCache[this.currentCategoryId] = {
                            "pageNo":this.pageNo,
                            "dataArray":this.childrenCategories,
                            "isEnd":flag
                        };
                        // Vue.set(this.subCategoryCache[parentId],'pageNo',1);
                        // Vue.set(this.subCategoryCache[parentId],'dataArray',this.childrenCategories);
                        this.resizeImgHeight();
                    })
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        //初始化一级纵向滚动
        initScrollYL: function () {
            setTimeout(function(){
                Vue.nextTick(function () {
                    new fz.Scroll('.category-tab', {
                        scrollY: true,
                        scrollX: false
                    });
                });
            },500)
        },
        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.item img').width();
                $('.item img').height(width);
            })
        },
    }
});