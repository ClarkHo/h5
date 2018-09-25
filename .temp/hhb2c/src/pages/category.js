import Vue from "vue";
import config from "../../env/config.js";
import UiFooter from "../components/ui-footer.vue";
import UiMessage from "../components/ui-message.vue";
import UiSetPosition from "../components/ui-set-position.vue";
import UiShare from "../components/ui-share.vue";
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload,{
    loading:config.defaultImg
});

let urlParams = Vue.utils.paramsFormat(window.location.href);
let hashParams = Vue.utils.hashFormat(window.location.href);
let hashStr = $.param(hashParams);

new Vue({
    el: 'body',
    components: { UiFooter,UiSetPosition ,UiMessage, UiShare},
    data: {
        //一级类目
        parentCategories: [],
        //二三级类目
        childrenCategories: [],
        //当前选中的分类id
        currentCategoryId: urlParams.categoryId,
        //二级分类cache
        subCategoryCache: {},
        locationCity: Vue.area.getArea().pN,
        lunbo: [],
        hotTitle: [],
        hotProduct: [],
        commonTitle: [],
        commonProduct: [],

        showLocation: false,
        showShare: false,   //显示分享
        shareConfig: {}, //分享配置
    },
    computed:{
        noRecommend: function(){
            "use strict";
            return [...this.lunbo,...this.hotProduct,...this.commonProduct].length===0;
        }
    },
    ready: function() {
        //初始化PageRestorer
        Vue.pageRestorer.init(this, "category");
        //restore页面的内容
        if (!Vue.pageRestorer.restore()) {
            this.getRecommend();
            this.getParentCategories();
        }
    },
    methods: {
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
        //初始化二三级纵向滚动
        initScrollYR: function () {
            setTimeout(function(){
                Vue.nextTick(function () {
                    new fz.Scroll('.category-content', {
                        scrollY: true,
                        scrollX: false
                    });
                });
            },500)
        },
        //获取一级分类
        getParentCategories: function () {
            var params = {parentId: 0, level: 1, companyId: Vue.mallSettings.getCompanyId()};
            Vue.api.get("/api/category/list", params, (result) => {
                if(result.data && result.data.categorys){
                    this.parentCategories = result.data.categorys;
                    this.initScrollYL();
                    //默认显示推荐
                    if (this.noRecommend && this.parentCategories.length > 0) {
                        if (!this.currentCategoryId){
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

        //获取二三级分类
        getChildrenCategories: function (parentId) {
            this.currentCategoryId = parentId;
            var url = "/category.html?categoryId="+ parentId;
            if (hashStr) {
                url += "#" + hashStr;
            }
            //更新url
            window.history.replaceState(null, "",  url);

            //优先使用cahce的数据
            if (this.subCategoryCache[parentId]) {
                this.childrenCategories = this.subCategoryCache[parentId];
                this.initScrollYR();
                return;
            }

            var params = {parentId: parentId, level: 2, companyId: Vue.mallSettings.getCompanyId()};
            Vue.api.get("/api/category/list", params, (result) => {
                if(result.data && result.data.categorys){
                    this.childrenCategories = result.data.categorys;
                    //cache
                    this.subCategoryCache[parentId] = this.childrenCategories;
                    this.resizeImgHeight();
                    this.initScrollYR();
                }
            }, () => {
                //处理掉不显示报错
            });
        },

        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.item img').width();
                $('.item img').height(width);
            })
        },

        getRecommend: function () {
            var url = "/category.html";
            if (hashStr) {
                url += "#" + hashStr;
            }
            //更新url
            window.history.replaceState(null, "",  url);
            this.currentCategoryId = 0;
            this.getDolphinList();
        },

        //获取推荐广告
        getDolphinList: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_CATEGORY_PAGE',
                adCode: 'img_sort_spread,title_hot_product,hot_product,title_common_product,common_product',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                var data=res.data;
                this.lunbo = data.img_sort_spread;
                this.hotTitle = data.title_hot_product[0] || {};
                this.hotProduct = data.hot_product;
                this.commonTitle = data.title_common_product[0] || {};
                this.commonProduct = data.common_product;
                this.initScrollYR();
                this.initSwipe();//初始化轮播
            }, () => {
                //处理掉不显示报错
            });
        },
        //更新location
        updateLocation: function () {
            this.locationCity = Vue.area.getArea().pN;
            //重新获取商品数据
            this.initScrollYL();
            this.initSwipe();
        }
    }
});