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
    data: {
        searchWord:'',
        parentCategories:[],
        currentCategoryId:'',
        childrenCategories:[],
        //二级分类cache
        subCategoryCache: {},
        pageNo:1,
        pageSize:10,
        amount:0,
        switchFlag:false
    },
    ready:function (params) {
        Vue.nextTick(() => {
            $('.ui-searchbar').tap(function(){
                $('.ui-searchbar-wrap').addClass('focus');
                $('.ui-searchbar-input input').focus();
            });
            $('.ui-searchbar-cancel').tap(function(){
                $('.ui-searchbar-wrap').removeClass('focus');
            });
        });
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
                    this.scrollLoading();
                    this.pageNo +=1;
                }
            }
        });
    },
    watch:{
        // childrenCategories:{
        //     handler:function () {
        //         try {
        //             var amount = 0;
        //             this.childrenCategories.forEach((v) => {
        //                 if(v.num > 0){
        //                     amount = ((amount - 0)*100 + (v.num * v.availablePrice)*100)/100;
        //                 }
        //             })
        //             this.amount = amount;
        //         } catch (error) {
                    
        //         }
        //     },
        //     deep:true
        // },
        childrenCategories:{
            handler:function () {
                try {
                    var amount = 0;
                    for(let v in this.subCategoryCache){
                        this.subCategoryCache[v].dataArray.forEach((item) => {
                            if(item.num > 0){
                                amount = ((amount - 0)*100 + (item.num * item.availablePrice)*100)/100;
                            }
                        })
                    }
                    this.amount = amount;
                } catch (error) {
                    
                }
            },
            deep:true
        }
    },
    computed:{
        //计算总价
        // amount:function () {
        //     var amount = 0;
        //     for(let v in this.subCategoryCache){
        //         this.subCategoryCache[v].dataArray.forEach((item) => {
        //             if(item.num > 1){
        //                 amount = ((amount - 0)*100 + (item.num * item.availablePrice)*100)/100;
        //             }
        //         })
        //     }
        //     return amount;
        // }
    },
    methods:{
        getSearchList:function (params) {
            
        },
        //获取一级分类
        getParentCategories: function () {
            var params = {parentId: 0, level: 1, companyId: Vue.mallSettings.getCompanyId()};
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
        getChildrenCategories: function (parentId,flag) {
            if(flag){
                this.subCategoryCache[this.currentCategoryId].pageNo = this.pageNo;
                this.switchFlag = true;
            }
            this.currentCategoryId = parentId;
            var url = "/member/quick-buy.html?categoryId="+ parentId;
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
                sortType:12,//按最新上架排序
                isSubProduct:1,//只查询子品
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
                            "isEnd":false
                        };
                    }
                    Vue.getPriceAndStock(mpIds.join(),result.data.productList,null,(obj) => {
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
                        this.initScrollYR();
                    })
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
                sortType:12,//按最新上架排序
                isSubProduct:1,//只查询子品
            };
            Vue.api.get(config.apiHost + '/api/search/searchList', params, (result) => {

                if(result.data && result.data.productList){
                    var mpIds = [];
                    result.data.productList.forEach((item) => {
                        item.num = 0;
                        mpIds.push(item.mpId);
                    });
                    Vue.getPriceAndStock(mpIds.join(),result.data.productList,null,(obj) => {
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
                        this.initScrollYR();
                    })
                }
            }, () => {
                //处理掉不显示报错
            });
        },
        checkNum:function (item) {
            if(item.num < 0){
                Vue.utils.showTips('购买数量不能小于1');
                item.num = 1;
                return;
            }
            if(item.num > item.stockNum){
                Vue.utils.showTips('库存不足');
                item.num = item.stockNum;
                return;
            }
        },
        changeNum:function (item,flag) {
            if(flag){
                if(item.num >= item.stockNum){
                    Vue.utils.showTips('库存不足');
                    return;
                }
                item.num = item.num-0 + 1;
                // Vue.set(item,'num',item.num-0 + 1);
            } else if(item.num > 0){
                item.num = item.num - 1;
            }
            
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
                    // new fz.Scroll('.category-content', {
                    //     scrollY: true,
                    //     scrollX: false
                    // });
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
        //加车
        addToCart:function (params) {
            if(this.amount == 0){
                Vue.utils.showTips('请选择商品');
                return;
            }
            this.getTempSkus((skus) => {
                var params = {
                    sessionId: Vue.session.getSessionId(),
                    skus:JSON.stringify(skus)
                };
                if(Vue.auth.loggedIn()){
                    params.ut = Vue.auth.getUserToken()
                }
                Vue.api.postForm(config.apiHost + "/api/cart/addItem", params, (res) => {
                    $.tips({
                        content:"添加成功",
                        stayTime:2000,
                        type:"success"
                    });
                },(res) => {
                    Vue.utils.showTips(res.message);
                });
            })
        },
        //立即购买
        buy:function () {
            if(this.amount == 0){
                Vue.utils.showTips('请选择商品');
                return;
            }
            this.getTempSkus((skus) => {
                var params = {
                    ut: Vue.auth.getUserToken(),
                    businessType:'7',
                    // merchantId: obj.merchantId,
                    platformId: config.platformId,
                    skus:JSON.stringify(skus)
                };
                Vue.utils.quickPurchase(params,(res) => {
                    window.location.href = "/pay/pay.html?q=1";
                    // Vue.utils.showTips(res.message);
                },false);
            })
        },
        //获取选中的商品skus
        getTempSkus:function (cb) {
            var tempSkus = [];
            for(let v in this.subCategoryCache){
                this.subCategoryCache[v].dataArray.forEach((item) => {
                    if(item.num > 0){
                        tempSkus.push({
                            "mpId":item.mpId,
                            "num":item.num,
                        })
                    }
                })
            }
            if(cb && typeof cb == 'function'){
                cb(tempSkus);
            }
        }
    }
});