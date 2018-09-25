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
        ut:Vue.auth.getUserToken(),
        invoice:""
    },

    ready:function(){
        this.getOrderDetail();
    },
    methods:{

        getOrderDetail:function() {

            var urlParams = Vue.utils.paramsFormat(window.location.href);
            var orderCode = urlParams.orderCode;
            if(!orderCode){
                return;
            }
            var param ={
                orderCode:orderCode,
                companyId:Vue.mallSettings.getCompanyId(),
                ut:Vue.auth.getUserToken(),
                v:2.1
            }
            var url = "/api/my/order/detail";
            Vue.api.get(url, param, (res) => {
                //获取电子发票路径
                if(!res.data.invoice.pdfUrl){
                    Vue.util.showTips("发票还在来的路上，请耐心等候")
                }
                 this.invoice = res.data.invoice.pdfUrl;

            },(res)=>{

            })

        }


    }
});