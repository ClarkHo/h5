import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        distributorId:'',
        pageNo: 1,
        pageSize: 10,
        level: '',
        inputVal:'',
        name:'',
        totalCount: 0,
        querySubList:[],//查看子店
        querySubList1:[]
    },
    ready: function() {
        this.distributorId = Vue.utils.paramsFormat(window.location.href).distributorId;
        this.level = Vue.utils.paramsFormat(window.location.href).level;
        this.name = Vue.utils.paramsFormat(window.location.href).name;
        this.name = decodeURIComponent(this.name);

        // 获取子店列表
        this.getQuerySubList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            if(this.querySubList1.length < this.totalCount) {
                this.pageNo += 1;
                this.getQuerySubList();
            }
        });
    },
    methods: {
        // 获取子店列表
        getQuerySubList: function() {
            var params = {
                ut: this.ut,
                level: this.level,
                distributorId: this.distributorId,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                //queryCondition: this.inputVal
            };
            Vue.api.get("" + "/api/seller/distributor/querySubList", params, (result) => {
                this.totalCount = result.data.totalCount;
                // this.querySubList = result.data.data;
                this.querySubList1 = this.querySubList1.concat(result.data.data);

            });
        },
        // 查询子店
        getPredictSubCommissionList: function() {
            var params = {
                ut: this.ut,
                level: this.level,
                distributorId: this.distributorId,
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                queryCondition: this.inputVal
            };
            Vue.api.get("" + "/api/seller/distributor/querySubList", params, (result) => {
                this.querySubList = [];
                this.querySubList = result.data.data;

            });
        },
    }
});
window.addEventListener('load', function(){

    var tab = new fz.Scroll('.ui-tab', {
        role: 'tab',
        autoplay: true,
        interval: 3000
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