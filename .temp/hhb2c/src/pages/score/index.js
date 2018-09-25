import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        userPoint:0,
        pointstore_homepage_banner:[],//轮播banner
        pointstore_homepage_pic:[],//魔方广告
        pointstore_homepage_recommend:[],//推荐广告
        pageNo:1,
        pageSize:10,
        recommendList:[],
        isEnd:false,
        isloadIng:false,
        loggedIn:Vue.auth.loggedIn()
    },
    ready:function (params) {
        if(Vue.auth.loggedIn()){
            this.getUserPoint();
        }
        this.getDolphinList();
        this.getRecommendList();
        //滚动加载更多数据
        Vue.scrollLoading({triggerHeight: 1000, callback: () => {
            if(!this.isEnd && !this.isloadIng &&  this.pageNo < 11){
                this.getRecommendList();
                this.pageNo += 1;
            }
        }});
    },
    methods:{
        getUserPoint: function () {
            let params = {companyId: config.companyId, ut: Vue.auth.getUserToken()};
            Vue.api.postForm("/api/my/point/account", params, (result) => {
                let data = result.data;
                if (data) {
                    this.userPoint = data.amountBalance - data.amountFreezed;
                }
            });
        },
        //获取推荐广告
        getDolphinList: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: config.platform,
                pageCode: 'H5_HOME',
                adCode: 'pointstore_homepage_banner,pointstore_homepage_pic,pointstore_homepage_recommend',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                this.pointstore_homepage_banner = res.data.pointstore_homepage_banner || [];
                this.pointstore_homepage_pic = res.data.pointstore_homepage_pic || [];
                this.pointstore_homepage_recommend = res.data.pointstore_homepage_recommend || [];
                this.initSwipe();//初始化轮播
            }, () => {
                //处理掉不显示报错
            });
        },
        initSwipe:function (params) {
            Vue.nextTick(() => {
                try {
                    var slider = new fz.Scroll('.ui-slider', {
                        role: 'slider',
                        indicator: true,
                        autoplay: true,
                        interval: 3000
                    });
                } catch (error) {
                    
                }
            })
        },
        getRecommendList:function (params) {
            var url = config.apiHost + '/api/search/searchList';
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),//公司id
                sortType: '15',//筛选过滤
                pageNo: this.pageNo,//当前页
                pageSize: this.pageSize,//当页显示数量
                platformId:config.platformId,
                areaCode: Vue.area.getArea().aC,
                isPointProduct:1,//查积分商品
                keyword:'*****'
            };
            this.isloadIng = true;
            Vue.api.get(url,param, (res) => {
                if(res.data && res.data.productList){
                    Vue.getPointProPriceAndStock((function (productList) {
                        "use strict";
                        var itemIds = [];
                        for (let p of productList) {
                            itemIds.push(p.mpId)
                        }
                        return itemIds.join();
                    })(res.data.productList),res.data.productList,null,(obj) => {
                        this.recommendList = this.recommendList.concat(res.data.productList || []);
                        this.resizeImgHeight();
                        if(res.data.productList.length < this.pageSize){
                            this.isEnd = true;
                        }
                        this.isloadIng = false;
                    })
                }
            })
        },
        resizeImgHeight: function () {
            Vue.nextTick(
                function(){
                    var w = $('.prod-list li >img').width();
                    $('.prod-list li >img').height(w);
                }
            )
        },

        canChange:function (params) {
            Vue.utils.goLogin(() => {
                location.href = '/score/score-search.html?pointPriceRange=0,' + this.userPoint;
            })
        }
    }
});