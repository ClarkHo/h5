import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        walletSummary: {},  //钱包概况
        platformId: config.platformId
    },
    ready: function() {
        this.getWalletSummary();
    },
    methods: {
        //收益概况
        getWalletSummary: function() {
            var params = {
                ut: this.ut,
                platformId:this.platformId,
                isECard:1,
                isYCard:1,
                isBean:1,
                isCoupon:1,
                isPoint:1
            };
            Vue.api.get(config.apiHost + "/api/my/wallet/summary", params, (res) => {
                this.walletSummary = res.data;
            });
        },
    }
});
