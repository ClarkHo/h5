import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiLocation from "../../components/ui-location.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheet, UiLocation },
    data: {
        //银行卡信息
        bankInfo: {
            bankId:'', //银行id
            bankName:'',//银行名字
            branchBankName:'', //支行/分行名称
            cardNo:'', //银行卡号
            cardNoConfirm:'',//确认银行卡
            cardholderName:'', //持卡人姓名
            branchBankProvince:'', //支行所在省份
            branchBankCity:'', //支行所在城市
            branchBankRegion:'', //支行所在县/区
            branchBankProvinceCode:'', //支行所在省份code
            branchBankCityCode:'', //支行所在城市code
            branchBankRegionCode:'' //支行所在县/区code
        },
        // 地区
        showArea: false,
        // 银行列表
        bankList:'',
        hideChooseBank:false
    },
    //初始化
    ready: function() {
        // 银行列表
        this.getBackList();

    },

    methods: {
    
        // 添加银行卡信息
        addBankInfo: function () {
            if(!this.bankInfo.bankId) {
                $.tips({
                    content: '请选择开户银行',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.branchBankProvince) {
                $.tips({
                    content: '请选择开户支行地区所在省份',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.branchBankCity) {
                $.tips({
                    content: '请选择开户支行地区所在城市',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.branchBankRegion) {
                $.tips({
                    content: '请选择开户支行地区所在区域',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.branchBankName) {
                $.tips({
                    content: '请输入开户支行',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.cardNo || (this.bankInfo.cardNo).length<16) {
                $.tips({
                    content: '请输入正确的银行账号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.cardNoConfirm || (this.bankInfo.cardNo).length<16) {
                $.tips({
                    content: '请输入正确的银行账号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.cardNo || this.bankInfo.cardNo != this.bankInfo.cardNoConfirm) {
                $.tips({
                    content: '前后两次输入的账号不一致',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankInfo.cardholderName) {
                $.tips({
                    content: '请输入持卡人姓名',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            var url = "" + '/api/my/bank/add';
            var param = {
                ut: Vue.auth.getUserToken(),
                cardNo:this.bankInfo.cardNo,
                bankId:this.bankInfo.bankId,
                branchBankName:this.bankInfo.branchBankName,
                branchBankProvinceCode:this.bankInfo.branchBankProvinceCode,
                branchBankCityCode:this.bankInfo.branchBankCityCode,
                branchBankRegionCode:this.bankInfo.branchBankRegionCode,
                cardholderName:this.bankInfo.cardholderName
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '添加银行卡成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    location.href = '/my/bank-list.html';
                }, 2000);
            });
        },
        // 银行列表
        getBackList: function() {
            var params = {};
            Vue.api.get("" + "/api/my/bank/bankList", params, (result) => {
                this.bankList = result.data.bankList;
            });
        },
        // 选择地区
        chooseArea: function (po) {
            this.bankInfo.branchBankProvince = po.pname;
            this.bankInfo.branchBankCity = po.cname;
            this.bankInfo.branchBankRegion = po.rname;
            this.bankInfo.branchBankProvinceCode = po.pcode;
            this.bankInfo.branchBankCityCode = po.ccode;
            this.bankInfo.branchBankRegionCode = po.rcode
        },
    }
});
