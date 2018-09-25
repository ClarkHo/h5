import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";
import VueLazyload from 'vue-lazyload';

Vue.use(VueLazyload, {
    loading: config.defaultImg
});

let urlParams = Vue.utils.paramsFormat(window.location.href);
let hashParams = Vue.utils.hashFormat(window.location.href);
let hashStr = $.param(hashParams);

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data: {
        //店铺类目
        shopTree: [],
        //一级类目
        parentCategories: [],
        //二三级类目
        childrenCategories: [],
        //当前选中的分类id
        currentCategoryId: urlParams.categoryId,
        //二级分类cache
        subCategoryCache: {},
        // locationCity: Vue.area.getArea().pN,
        lunbo: [],
        hotTitle: [],
        hotProduct: [],
        commonTitle: [],
        commonProduct: [],
        noRecommend: false,
        showLocation: false,
        merchantId: urlParams.merId || 336,
    },
    ready: function () {
        // //初始化PageRestorer
        // Vue.pageRestorer.init(this, "category");
        // //restore页面的内容
        // if (!Vue.pageRestorer.restore()) {
        //     this.getParentCategories();
        // }
        // this.getParentCategories();
        this.getShopcateTree();

    },
    methods: {
        //初始化一级纵向滚动
        initScrollYL: function () {
            setTimeout(function () {
                Vue.nextTick(function () {
                    new fz.Scroll('.category-tab', {
                        scrollY: true,
                        scrollX: false
                    });
                });
            }, 500)
        },
        //初始化二三级纵向滚动
        initScrollYR: function () {
            setTimeout(function () {
                Vue.nextTick(function () {
                    new fz.Scroll('.category-content', {
                        scrollY: true,
                        scrollX: false
                    });
                });
            }, 500)
        },
        // 获取店铺分类类目树id
        getShopcateTree: function () {
            let params = {
                merchantId: this.merchantId,
                // cateTreeType: 1
            };
            Vue.api.postForm("/back-product-web/merchantProductAppAction/getMerchantAPPCateTree.do", params, (result) => {
                this.getMerchantTree(result);
            }, () => {

            })
        },
        //获取店铺分类一级、二级、三级分类类目树
        getMerchantTree: function (item) {
            if(!item.data.id){
                Vue.utils.showTips('类目树id错误');
                return;
            }
            let params = {
                // merchantId: this.merchantId,
                id: item.data.id
            }
            
            Vue.api.postForm('/back-product-web/merchantProductAppAction/getCategoryTreeApp.do', params, (result) => {
                if(result.data){
                    this.parentCategories = result.data.childList;
                    if(this.parentCategories.length)
                    this.childrenCategories = this.parentCategories[0].childList;
                    this.currentCategoryId = this.parentCategories[0].categoryId;
                    this.initScrollYL();
                    this.initScrollYR();
                }
            },(result) => {
                
            })
        },
        

        //获取二三级分类
        getChildrenCategories: function (parentId) {
            if(this.currentCategoryId == parentId){
                return;
            }
            this.currentCategoryId = parentId;
            this.parentCategories.forEach((item) => {
                // console.log(item)
                if(item.categoryId == parentId){
                    this.childrenCategories = item.childList;
                    return;
                }
            })
        },

        //重置图片大小
        resizeImgHeight: function () {
            Vue.nextTick(function () {
                var width = $('.item img').width();
                $('.item img').height(width);
            })
        }
    }
});