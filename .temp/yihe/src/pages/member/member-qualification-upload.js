import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiFileUpload},
    data: {
        ut: Vue.auth.getUserToken(),
        companyId: Vue.mallSettings.getCompanyId(),
        VATInvoice:{
            "registrationCertificatePath":'',//税务登记证
            "businessLicensePath":'',//增票授权委托书
            "bankLicensePath":'',//开户银行许可证
        },
        sectionShow : -1, //-1 未提交，1审核中，待审核，2 已通过。
    },
    ready: function() {
        this.checkHasvolunteer();
    },
    methods: {
        //对用户状态进行验证
        checkHasvolunteer:function(){
            let params = {
                ut:Vue.auth.getUserToken(),
                identityTypeCode:4,
            }
            Vue.api.postForm("/ouser-center/api/user/info/detail.do", params, (result) => {
                if(result.code == 0){
                     var msg = result.data;
                     this.sectionShow = msg.userInfo.licenseAuditStatus;
                }else{

                }
            });
        },

        //
        addPipeInvoice: function () {


            if(!this.VATInvoice.registrationCertificatePath) {
                $.tips({
                    content: '请上传税务登记副本',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.VATInvoice.businessLicensePath) {
                $.tips({
                    content: '请上传营业执照',
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

            let params = {
                identityTypeCode:43,
                ut:Vue.auth.getUserToken(),
                taxRegistrationPhoto:this.VATInvoice.registrationCertificatePath,
                accountOpeningPhoto:this.VATInvoice.bankLicensePath,
                businessLicencePhoto:this.VATInvoice.businessLicensePath,
            };
            Vue.api.postForm("/ouser-center/api/user/member/applyMemberIdentity.do", params, (result) => {
                if(result.code == 0){
                    //界面变为审核中
                    this.sectionShow = 0;
                }else{
                    $.tips({
                        content: result.message |'提交失败',
                        stayTime: 2000,
                        type: "warn"
                    });
                }
            });

        },

        VATstep2:function () {
            if(!this.VATInvoice.registrationCertificatePath) {
                $.tips({
                    content: '请上传税务登记证副本',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.VATInvoice.businessLicensePath) {
                $.tips({
                    content: '营业执照登记证书',
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
            this.navActive = 2;
        },
        //图片上传成功
        uploadSuccess_RegistrationCertificatePath: function (data) {
            this.VATInvoice.registrationCertificatePath = data.filePath;
        },
        uploadSuccess_BusinessLicensePath: function (data) {
            this.VATInvoice.businessLicensePath = data.filePath;
        },
        uploadSuccess_BankLicensePath: function (data) {
            this.VATInvoice.bankLicensePath = data.filePath;
        },

    }
});
