import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        incomeOverview: [],  //收益概况
    },
    ready: function() {
        this.getIncomeOverview();
    },
    methods: {
        //收益概况
        getIncomeOverview: function() {
            var params = {
                ut: this.ut
            };
            Vue.api.get("" + "/api/seller/income/incomeSummary", params, (res) => {
                    this.incomeOverview = res.data;
            });
        },
    }
});
