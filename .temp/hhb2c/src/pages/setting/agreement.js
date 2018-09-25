import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        companyId: Vue.mallSettings.getCompanyId(),
        protocolTitle: "",
        registerProtocol: ""
    },
    ready: function() {
        this.getUserRegisterProtocol();
    },
    methods: {
        getUserRegisterProtocol: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: config.pageCode,
                adCode: 'reg_protocol',
                companyId: this.companyId,
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data.reg_protocol && res.data.reg_protocol[0]) {
                    this.protocolTitle = res.data.reg_protocol[0].title;
                    this.registerProtocol = res.data.reg_protocol[0].content;
                }
            });
        }
    }
});
