import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../config/default.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        msgSummary: [],
        // msgSummary_customer: [],
        // msgSummary_message: [],
        companyId: Vue.mallSettings.getCompanyId()
    },
    ready: function() {
        this.getMsgSummary();
    },
    methods: {
        //获取消息摘要
        getMsgSummary: function() {
            var params = {
                ut: this.ut,
                companyId: this.companyId
            };
            Vue.api.get(config.apiHost + "/api/social/vl/message/getMsgSummary", params, (result) => {

                this.msgSummary = result.data;
                // this.msgSummary_customer = result.data.customer;
                // this.msgSummary_message = result.data.message;

            });
        }

}
});
