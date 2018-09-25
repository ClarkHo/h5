import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

// var.predictType = Vue.utils.paramsFormat(window.location.href).predictType;

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        // 流量统计
        traffic_pv: [],  //点击量
        traffic_share: [],//分享数
        traffic_uv: [],  //总访客数
        traffic_vip: [],  //VIP访问
        // 销售统计
        sale_sale: [],
        // 子铺统计
        subDistributor_pv: [],  //点击量
        subDistributor_sale: [],//销量
        subDistributor_share: [],  //分享数
        // top商品
        sortType:2,
        top:20,
        topProductTraffic:'',
        topProductSale:'',
        // 子铺分页查询
        pageSubDistributor:'',
        searchPama:'',
        page:1,
        pageNum:10
    },
    ready: function() {

        //流量统计
        this.getTrafficInfo();
        //销售统计
        this.getSaleInfo();
        //子铺统计
        this.getSubDistributorInfo();
        // TOP商品
        this.getTopProductTraffic();
        this.getTopProductSale();
        // 子铺查询 默认展示全部
        this.getPageSubDistributor();
        // 滚动加载更多数据
        Vue.scrollLoading(() => {
            this.page += 1;
            // this.getPageSubDistributor();
            // this.getTopProductTraffic();
            // this.getTopProductSale();
        });
    },
    methods: {

        // 加载流量统计
        getTrafficInfo: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/trafficInfo.do", params, (result) => {
                this.traffic_pv = result.data.pv;
                this.traffic_share = result.data.share;
                this.traffic_uv = result.data.uv;
                this.traffic_vip = result.data.vip;
            });
        },
        // 加载销售统计
        getSaleInfo: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/saleInfo.do", params, (result) => {
                this.sale_sale = result.data.sale;
            });
        },
        // 加载子铺统计
        getSubDistributorInfo: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/subDistributorInfo.do", params, (result) => {
                this.subDistributor_pv = result.data.pv;
                this.subDistributor_sale = result.data.sale;
                this.subDistributor_share = result.data.share;
            });
        },
        // TOP商品 流量
        getTopProductTraffic: function() {
            var params = {
                ut: this.ut,
                sortType: 1,
                top: this.top
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/topProduct.do", params, (result) => {
                this.topProductTraffic = result.data;
                // this.topProductTraffic = this.topProductTraffic.concat(result.data);
            });
        },
        // TOP商品 销售
        getTopProductSale: function() {
            var params = {
                ut: this.ut,
                sortType: 2,
                top: this.top
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/topProduct.do", params, (result) => {
                this.topProductSale = result.data;
                // this.topProductSale = this.topProductSale.concat(result.data);
            });
        },
        // 子铺分页查询
        getPageSubDistributor: function() {
            var params = {
                ut: this.ut,
                page: this.page,
                pageNum: this.pageNum,
                searchPama: this.searchPama
            };
            Vue.api.get("" + "/obi-web/api/reportCenter/pageSubDistributor.do", params, (result) => {
                this.pageSubDistributor = result.data;
                // this.pageSubDistributor = this.pageSubDistributor.concat(result.data);
            });
        }

    }
});

// tab
window.addEventListener('load', function(){

    var tab = new fz.Scroll('.ui-tab', {
        role: 'tab',
        autoplay: false,
        interval: 9000
    });

    /* 滑动开始前 */
    tab.on('beforeScrollStart', function(from, to) {
        // from 为当前页，to 为下一页
    })

    /* 滑动结束 */
    tab.on('scrollEnd', function(curPage) {
        // curPage 当前页
    });

})