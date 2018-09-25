import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        exchangeList:[],
        exType:'1',
        pageSize:10,
        pageNo:1,
        isEnd:false,
    },
    ready:function () {
        this.getExchangeList();
        Vue.scrollLoading(() => {
            if (!this.isEnd) {
                this.pageNo += 1;
                this.getExchangeList(true);
            }
        });
    },
    methods:{
        getExchangeList:function (scroll) {
            let url = config.apiHost + '/api/my/order/list';
            let params = {
                ut:Vue.auth.getUserToken(),
                companyId:Vue.mallSettings.getCompanyId(),
                orderStatus:0,
                pageNo:this.pageNo,
                pageSize:this.pageSize,
                sysSourceList:'INTEGRAL_MALL'
            };
            if(this.exType != '1'){
                params.orderType = this.exType;
            }
            Vue.api.get(url, params, (res) => {
                if(res.data) {
                    if(res.data.orderList && res.data.orderList.length < this.pageSize){
                        this.isEnd = true;
                    }
                    if(scroll){
                        this.exchangeList = this.exchangeList.concat(res.data.orderList || []);
                    } else {
                        this.exchangeList = res.data.orderList || [];
                    }
                }
            })
        },
        swtichTab:function (type) {
            this.exType = type;
            this.getExchangeList();
        }
    }
});