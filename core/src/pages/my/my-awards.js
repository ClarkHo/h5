import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiDropDown from "../../components/ui-drop-down.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader ,UiDropDown},
    data: {
        ut: Vue.auth.getUserToken(),
        //中奖记录
        winningRecords: [],
        //当前页数
        currentPage: 1,
        itemsPerPage: 10,
        totalCount: 0,
        loaded: false,
        stopDropDown:false//下拉刷新
    },
    //初始化
    ready: function() {
        this.getWinningRecords();

        Vue.scrollLoading(() => {
            if (this.winningRecords.length < this.totalCount) {
                this.currentPage += 1;
                this.getWinningRecords();
            }
        });
    },
    methods: {
        dropDown: function () {
            this.currentPage = 1;
            this.winningRecords=[];
            this.getWinningRecords();
            setTimeout(() => {
                this.stopDropDown = true;
            }, 2000);
        },
        //获取中奖记录
        getWinningRecords: function() {
            var params = {
                ut: this.ut,
                currentPage: this.currentPage, 
                itemsPerPage: this.itemsPerPage
            };

            Vue.api.get("/api/promotion/lottery/winningRecords", params, (result) => {
                this.loaded = true;
                if (result.data.listObj) {
                    this.winningRecords = this.winningRecords.concat(result.data.listObj || []);
                    this.totalCount = result.data.total || 0;
                }
            });

        },

        //普通商品加车处理
        addToCart: function (record) {
            var params = {ut: this.ut, mpId: record.awardsId, num: record.awardsNum || 1, sessionId: Vue.session.getSessionId(), itemType: 3, objectId: record.recordId};
            Vue.api.postForm("/api/cart/addItem", params, (result) => {
                location.href = "/cart.html";
            });
        }

    }
});
