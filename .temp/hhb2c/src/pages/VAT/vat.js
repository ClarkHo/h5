import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import UiLocation from "../../components/ui-location.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiFileUpload,UiLocation},
    data: {
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),
        VATInvoice:{
           "id":'',//增票信息id
           "userId":'',//用户Id
           "unitName":'',//单位名称
           "taxpayerIdentificationCode":'',//纳税人识别码
           "registerAddress":'',//注册地址
           "registerPhone":'',//注册电话
           "bankDeposit":'',//开户银行
           "bankAccount":'',//银行账户
           "goodReceiverAddress":'',//详细地址
           "goodReceiverName":'',//收票人姓名
           "goodReceiverMobile":'',//收票人手机
           "goodReceiverProvinceId":'',//收票人省份Id
           "goodReceiverProvince":'',//收票人省份
           "goodReceiverCityId":'',//收票人城市Id
           "goodReceiverCity":'',//收票人城市
           "goodReceiverAreaId":'',//收票人区域Id
           "goodReceiverArea":'',//收票人区域
           "registrationCertificatePath":'',//税务登记证
           "generalTaxpayerCertificatePath":'',//一般纳税人证书
           "increaseTicketAuthorizePath":'',//增票授权委托书
           "bankLicensePath":'',//开户银行许可证
           "auditStatus":'',//审核状态
        },
        navActive:0,//导航状态
        addrState:false,//地址状态
        showArea: false,
    },
    ready: function() {

    },
    methods: {
        // LYF -新增增值税发票
        addVATInvoice: function () {
            if (!this.checkStep1()){
                return;
            }
            // --
            if (!this.checkStep2()){
                return;
            }
            // --
            if(!this.VATInvoice.goodReceiverName || (this.VATInvoice.goodReceiverName.length<2)) {
                $.tips({
                    content: '请填写收票人',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.goodReceiverMobile) {
                $.tips({
                    content: '请填写联系方式',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.goodReceiverArea) {
                $.tips({
                    content: '请选择所在地区',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.goodReceiverAddress || (this.VATInvoice.goodReceiverAddress.length>50)) {
                $.tips({
                    content: '请填写详细地址',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };


            let params = {
                ut: this.ut,
                unitName:this.VATInvoice.unitName,
                taxpayerIdentificationCode:this.VATInvoice.taxpayerIdentificationCode,
                registerAddress:this.VATInvoice.registerAddress,
                registerPhone:this.VATInvoice.registerPhone,
                bankDeposit:this.VATInvoice.bankDeposit,
                bankAccount:this.VATInvoice.bankAccount,
                increaseTicketAuthorizePath:this.VATInvoice.increaseTicketAuthorizePath,
                registrationCertificatePath:this.VATInvoice.registrationCertificatePath,
                generalTaxpayerCertificatePath:this.VATInvoice.generalTaxpayerCertificatePath,
                bankLicensePath:this.VATInvoice.bankLicensePath,
                goodReceiverName:this.VATInvoice.goodReceiverName,
                goodReceiverMobile:this.VATInvoice.goodReceiverMobile,
                goodReceiverProvince:this.VATInvoice.goodReceiverProvince,
                goodReceiverCity:this.VATInvoice.goodReceiverCity,
                goodReceiverArea:this.VATInvoice.goodReceiverArea,
                goodReceiverAddress:this.VATInvoice.goodReceiverAddress,
            };
            Vue.api.postForm("/api/my/editVATInvoice", params, (result) => {
                document.location.href='/VAT/vat-edit.html';
            });
        },
        checkStep1: function(){
            if(!this.VATInvoice.unitName || (this.VATInvoice.unitName.length<2)) {
                $.tips({
                    content: '请填写正确的公司名称',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.taxpayerIdentificationCode) {
                $.tips({
                    content: '请填写纳税人识别码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.registerAddress || (this.VATInvoice.registerAddress.length>50)) {
                $.tips({
                    content: '请填写正确的注册地址',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.registerPhone || (this.VATInvoice.registerPhone.length>20) ) {
                $.tips({
                    content: '请填写正确的注册电话',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!this.VATInvoice.bankDeposit) {
                $.tips({
                    content: '请填写开户银行',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            };
            if(!/^\d{2,30}$/.test(this.VATInvoice.bankAccount) || !this.VATInvoice.bankAccount) {
                $.tips({
                    content: '请填写正确的银行账户',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            return true;
        },
        checkStep2:function(){
            if(!this.VATInvoice.registrationCertificatePath) {
                $.tips({
                    content: '请上传税务登记证副本',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.VATInvoice.generalTaxpayerCertificatePath) {
                $.tips({
                    content: '请上传一般纳税人证书',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.VATInvoice.bankLicensePath) {
                $.tips({
                    content: '请上传开户银行许可证',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.VATInvoice.increaseTicketAuthorizePath) {
                $.tips({
                    content: '请上传增票授权委托书',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            return true;
        },
        VATstep1:function () {
            if (!this.checkStep1()){
                return;
            }
            this.navActive = 1;
        },
        VATstep2:function () {
            if (!this.checkStep2()){
                return;
            }
            this.navActive = 2;
        },
        //图片上传成功
        uploadSuccess_IncreaseTicketAuthorizePath: function (data) {
            this.VATInvoice.increaseTicketAuthorizePath = data.filePath;
        },
        uploadSuccess_RegistrationCertificatePath: function (data) {
            this.VATInvoice.registrationCertificatePath = data.filePath;
        },
        uploadSuccess_GeneralTaxpayerCertificatePath: function (data) {
            this.VATInvoice.generalTaxpayerCertificatePath = data.filePath;
        },
        uploadSuccess_bankLicensePath: function (data) {
            this.VATInvoice.bankLicensePath = data.filePath;
        },
        chooseArea: function (po) {
            this.VATInvoice.goodReceiverProvince = po.pname;
            this.VATInvoice.goodReceiverCity = po.cname;
            this.VATInvoice.goodReceiverArea = po.rname;
        }
    }
});
