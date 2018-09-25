import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        // fansCount: 0,
    },
    ready: function() {
        // this.getSummary();
    },
    methods: {
        // //get 粉丝、顾客数量
        // getSummary: function(){
        //     var url = "" + '/api/seller/fans/summary';
        //     var param = {
        //         companyId: Vue.mallSettings.getCompanyId(),
        //         ut: Vue.auth.getUserToken()
        //     };
        //     Vue.api.get(url, param, (res) => {
        //         this.fans= res.data.fans;
        //         this.fansCount = res.data.fansCount;
        //         this.customerCount = res.data.customerCount;
        //     }, (res) => {
        //         Vue.api._showError(res.message);
        //     })
        // },
    }
});
