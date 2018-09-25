import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import UiShare from "../components/ui-share.vue";
import config from "../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiShare },
    data: {
        rightNavFlag: false,
        channel: []
    },
    ready: function() {
        this.getIndexAds();
    },
    methods: {
        //
        getIndexAds: function () {
            var url = "" + '/api/dolphin/list';
            var param = {
                platform: 2,
                pageCode: config.pageCode,
                adCode: 'channel',
                companyId: this.companyId
            };
            Vue.api.get(url, param, (res) => {
                this.channel = res.data.channel;
            });
        }
    }
});
