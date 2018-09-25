import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ybean:{
            cardCode:'', //伊点卡卡号
            cardPwd:'', //伊点卡密码
        },
        ecard: {},
        inquireState:false,
        platformId: config.platformId
    },
    ready: function() {
        if(this.ybean.cardCode && this.ybean.cardPwd){
            this.inquireState = true;
        }
    },
    computed:{
        inquireState:function () {
            if(this.ybean.cardCode && this.ybean.cardPwd){
                return true;
            };

        },
    },
    methods: {
        // LYF - 根据卡号、密码查询伊点卡余额
        getYbean: function () {
            this.ecard = {};
            let params = {
                platformId: this.platformId,
                cardCode: this.ybean.cardCode,
                cardPwd: this.ybean.cardPwd,
            };
            Vue.api.postForm("/api/my/wallet/eInfo", params, (result) => {
                    this.ecard =  result.data || {};
            });
        },
    }
});
