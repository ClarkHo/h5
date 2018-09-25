import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        myBill: [], //购物账单
        incomeBill: [],  //收益账单
        startTimeStr: '2016-01-01',
        endTimeStr: '2016-10-01',
        pageNo: 1,
        pageSize:10,
        filterFlag:1
    },
    ready: function() {
        this.getMyBill();
        this.getIncomeBill();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getMyBill();
        });
    },
    methods: {
        //购物账单
        getMyBill: function() {
            var params = {
                ut: this.ut,
                startTimeStr: this.startTimeStr,
                endTimeStr: this.endTimeStr,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/my/bill", params, (result) => {
                // this.myBill = result.data.data;
                this.myBill = this.myBill.concat(result.data.data);
            });
        },
        //收益账单
        getIncomeBill: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/api/seller/income/bill", params, (result) => {
                this.incomeBill = result.data.data;
            });
        }
    }
});

window.addEventListener('load', function(){

    var tab = new fz.Scroll('.ui-tab', {
        role: 'tab',
        autoplay: false,
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

