import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import UiLocation from "../../components/ui-location.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiLocation,UiFileUpload },
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
        isEdit:false,//是否是编辑状态
        showArea: false,
    },
    ready: function() {
        this.showVATInvoic();
    },
    methods: {
        back:function (params) {
          location.replace('/my/home.html')  
        },
        // LYF -查询增值税发票
        showVATInvoic: function () {
            let params = {
                companyId: this.companyId,
                ut: this.ut
            };
            Vue.api.post("/api/my/showVATInvoice", params, (result) => {
                this.VATInvoice = result.data;
            });
        },
        // LYF -修改增值税发票
        editVATInvoice: function () {
            let params = {
                id:this.VATInvoice.id,//增票信息id
                userId:this.VATInvoice.userId,//用户Id
                unitName:this.VATInvoice.unitName,//单位名称
                taxpayerIdentificationCode:this.VATInvoice.taxpayerIdentificationCode,//纳税人识别码
                registerAddress:this.VATInvoice.registerAddress,//注册地址
                registerPhone:this.VATInvoice.registerPhone,//注册电话
                bankDeposit:this.VATInvoice.bankDeposit,//开户银行
                bankAccount:this.VATInvoice.bankAccount,//银行账户
                goodReceiverAddress:this.VATInvoice.goodReceiverAddress,//详细地址
                goodReceiverName:this.VATInvoice.goodReceiverName,//收票人姓名
                goodReceiverMobile:this.VATInvoice.goodReceiverMobile,//收票人手机
                goodReceiverProvinceId:this.VATInvoice.goodReceiverProvinceId,//收票人省份Id
                goodReceiverProvince:this.VATInvoice.goodReceiverProvince,//收票人省份
                goodReceiverCityId:this.VATInvoice.goodReceiverCityId,//收票人城市Id
                goodReceiverCity:this.VATInvoice.goodReceiverCity,//收票人城市
                goodReceiverAreaId:this.VATInvoice.goodReceiverAreaId,//收票人区域Id
                goodReceiverArea:this.VATInvoice.goodReceiverArea,//收票人区域
                registrationCertificatePath:this.VATInvoice.registrationCertificatePath,//税务登记证
                generalTaxpayerCertificatePath:this.VATInvoice.generalTaxpayerCertificatePath,//一般纳税人证书
                increaseTicketAuthorizePath:this.VATInvoice.increaseTicketAuthorizePath,//增票授权委托书
                bankLicensePath:this.VATInvoice.bankLicensePath,//增票授权委托书
            };
            Vue.api.postForm("/api/my/editVATInvoice", params, (result) => {
                $.tips({
                    content: '修改成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.isEdit=false;
            });
        },
        beEdit:function () {
            this.isEdit=true;
            $('input[type=text]').removeAttr('readonly');
        },
        chooseArea: function (po) {
            this.VATInvoice.goodReceiverProvince = po.pname;
            this.VATInvoice.goodReceiverCity = po.cname;
            this.VATInvoice.goodReceiverArea = po.rname;
        },
        ifShowArea:function () {
            if(this.isEdit){
                this.showArea = true;
            }
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
    }
});
