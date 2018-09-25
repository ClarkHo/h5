import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";

var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        showReceiptNotice: false,//发票须知
        isNeed: false,//是否需要发票
        invoiceCont: {
            detail: '',//需要明细
            computer: '电脑配件',
            things: '办公用品',
            material: '耗材'
        },
        invoice: {
            invoiceType: 0,//发票类型(0:不需要发票;1：普通；2：增值税)
            invoiceTitleType: 0,//发票抬头类型（1：个人；2：单位）
            invoiceTitleContent: '',//发票抬头内容
            isNeedDetails: 0,//是否需要明细（1：需要 0:不需要）
            invoiceContentId: 1,//默认1
            invoiceContent: '',//发票内容
        }

    },
    ready: function() {

    },
    methods: {
        //保存发票信息
        saveOrderInvoice: function(){
            if(this.invoice.invoiceTitleType == 2 && this.invoice.invoiceTitleContent == ''){
                var el = $.tips({
                    content: '请填写发票抬头',
                    stayTime: 2000,
                    type: "warn"
                })
            }else{
                if (!this.isNeed) this.invoice.invoiceType = 0;
                if(this.invoice.invoiceContent == '')
                    this.invoice.isNeedDetails = 1;
                else
                    this.invoice.isNeedDetails = 0;
                if(this.invoice.invoiceTitleType == 1) this.invoice.invoiceTitleContent = '';

                var param = this.invoice;
                param.ut = Vue.auth.getUserToken();
                param.companyId = Vue.mallSettings.getCompanyId();

                var url = "" + '/api/checkout/saveOrderInvoice';
                Vue.api.postForm(url, param, (res) => {
                    var el = $.tips({
                        content: '发票保存成功',
                        stayTime: 2000,
                        type: "warn"
                    })
                }, (res) => {
                    console.log(res)
                })

            }
        }
    }
})

