import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        cardList: [],  //银行卡列表
        pageNo: 1,
        pageSize: 10
    },
    ready: function() {
        //加载首屏内容
        this.getBankCardList();
        //滚动加载更多数据
        Vue.scrollLoading(() => {
            this.pageNo += 1;
            this.getBankCardList();
        });
    },
    methods: {
        //加载银行卡列表
        getBankCardList: function() {
            var params = {
                ut: this.ut,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            };
            Vue.api.get("" + "/api/my/bank/list", params, (result) => {

                this.cardList = result.data.bankCardList;

            });
        },
    }
});

