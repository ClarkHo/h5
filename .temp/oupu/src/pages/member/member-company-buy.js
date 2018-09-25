import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";


new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{
        memberInfo:{
            enterpriseSecret:null,//企业密令（优购码）
            enterpriseName:null,//企业名称
        },
        newEnterpriseSecret:null,
        hasEnterpriseSecret:true,//是否已绑定密令（优购码）
        urlParams:Vue.utils.paramsFormat(window.location.href),
        companyId:Vue.mallSettings.getCompanyId(),
        ut:Vue.auth.getUserToken()
    },
    ready:function(){
        this.getMemberInfo();
    },
    methods:{
        getMemberInfo:function(){
            let self = this;
            let params = {
                userId : null,
                identityTypeCode:4// 用户类型（7-加盟门店；4-会员）
            }
            Vue.api.postForm("/ouser-center/api/user/info/detail.do", params, (result) => {
                let data = result.data;
                if (data && data.memberInfo) {
                    if(data.memberInfo && data.memberInfo.enterpriseSecret && data.memberInfo.enterpriseName){
                        self.hasEnterpriseSecret = true;
                        self.memberInfo.enterpriseSecret = data.memberInfo.enterpriseSecret;
                        self.memberInfo.enterpriseName = data.memberInfo.enterpriseName;
                    }else{
                        self.hasEnterpriseSecret = false;
                    }
                }else{
                    Vue.utils.showTips(result.message || '请稍后重试');
                }
            });
        },
        saveMemberInfo:function(){
            let self = this;
            let params = {
                identityTypeCode:42,
                enterpriseSecret:self.newEnterpriseSecret || self.memberInfo.enterpriseSecret
            };
            if(!self.memberInfo.enterpriseSecret){
                Vue.utils.showTips('请输入您的企业优购码');
                return;
            }
            Vue.api.postForm("/ouser-center/api/user/member/applyMemberIdentity.do",params, (result) =>{
                Vue.utils.showTips('操作成功');
                self.newEnterpriseSecret = null;
                self.getMemberInfo();
            });
        },
        changeMemberInfo:function(){
            let self = this;
            let params = {
                identityTypeCode:42,
                enterpriseSecret:self.newEnterpriseSecret
            }
            if(!self.newEnterpriseSecret){
                Vue.utils.showTips('请输入您的企业优购码');
                return;
            }else if(self.newEnterpriseSecret == self.memberInfo.enterpriseSecret){
                Vue.utils.showTips('不能重复绑定优购码');
                return;
            }
            Vue.api.postForm("/ouser-center/api/user/member/applyMemberIdentity.do",params, (result) =>{
                Vue.utils.showTips('操作成功');
                self.newEnterpriseSecret = null;
                self.getMemberInfo();
            });
        }
    }
});