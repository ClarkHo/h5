import Vue from "vue";
import UiHeader from "../../components/ui-header.vue"
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        instruction:[],//广告list
    },
    ready: function() {
        this.getExplainUrl();
    },
    methods: {
        //读取广告链接
        getExplainUrl: function () {
            var url = config.apiHost + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: "H5_PINTUAN_RULE_PAGE",
                adCode: 'pintuan_rule_instruction',
                companyId: Vue.mallSettings.getCompanyId(),
                areaCode: Vue.area.getArea().aC,
            };
            Vue.api.get(url, param, (res) => {
                if(res.data){
                    this.instruction = res.data.pintuan_rule_instruction || '';
                }
            });
        },
    }
});
