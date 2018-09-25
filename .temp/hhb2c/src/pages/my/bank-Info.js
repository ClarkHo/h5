import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiLocation from "../../components/ui-location.vue";
import UiDialogCaptchas from "../../components/ui-dialog-captchas.vue";
import config from "../../../env/config.js";

new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheet, UiLocation ,UiDialogCaptchas},
    data: {
        //银行卡信息
        bankDetail: {
            bankId:'', //银行id
            branchBankName:'', //支行/分行名称
            cardNo:'', //银行卡号
            cardNoConfirm:'',//确认银行卡
            cardholderName:'', //持卡人姓名
            branchBankProvince:'', //支行所在省份
            branchBankCity:'', //支行所在城市
            branchBankRegion:'', //支行所在县/区
            branchBankProvinceCode:'', //支行所在省份Code
            branchBankCityCode:'', //支行所在城市Code
            branchBankRegionCode:'' //支行所在县/区Code
        },
        // 地区
        showArea: false,
        bankList:'',
        hideChooseBank:false,
        bankCardId:'',
        updateBankInfoBox:false,
        bankInfoBox:true,
        captchas:'',
        smsBtn:'发送验证码',
        vicodeDialog: false
    },
    //初始化
    ready: function() {
        this.bankCardId = Vue.utils.paramsFormat(window.location.href).bankCardId;
        // 银行列表
        this.getBackList();
        // 银行卡信息
        this.getBankDetail();

    },

    methods: {
        // 银行卡信息
        getBankDetail: function() {
            var params = {
                ut: Vue.auth.getUserToken(),
                bankCardId:this.bankCardId
            };
            Vue.api.get("" + "/api/my/bank/detail", params, (result) => {
                this.bankDetail = result.data;
            });
        },
        //
        showImgViCode: function () {
            this.vicodeDialog = true;//显示
        },
        // 修改银行卡信息
        updateBankInfo: function () {
            if(!this.bankDetail.branchBankName) {
                $.tips({
                    content: '请输入正确的支行信息',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if((this.bankDetail.cardNo).length<16) {
                $.tips({
                    content: '请输入正确的银行卡号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.bankDetail.cardholderName) {
                $.tips({
                    content: '请输入持卡人信息',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.captchas || !/^[0-9]{6}$/.test(this.captchas)) {
                $.tips({
                    content: '请输入6位数字验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };

            
            var url = "" + '/api/my/bank/update';
            var param = {
                ut: Vue.auth.getUserToken(),
                bankCardId:this.bankCardId,
                cardNo:this.bankDetail.cardNo,
                bankId:this.bankDetail.bankId,
                branchBankName:this.bankDetail.branchBankName,
                branchBankProvinceCode:this.bankDetail.branchBankProvinceCode,
                branchBankCityCode:this.bankDetail.branchBankCityCode,
                branchBankRegionCode:this.bankDetail.branchBankRegionCode,
                cardholderName:this.bankDetail.cardholderName,
                captchas:this.captchas
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '修改银行卡信息成功',
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
            this.bankDetail.branchBankProvinceName = po.pname;
            this.bankDetail.branchBankCityName = po.cname;
            this.bankDetail.branchBankRegionName = po.rname;
            this.bankDetail.branchBankProvinceCode = po.pcode;
            this.bankDetail.branchBankCityCode = po.ccode;
            this.bankDetail.branchBankRegionCode = po.rcode;
        },
    }
});
