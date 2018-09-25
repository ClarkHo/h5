import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";
import UiBtnCopy from "../../components/ui-btn-copy.vue";
let urlParams = Vue.utils.paramsFormat(window.location.href);



new Vue({
    el: 'body',
    components: {
        UiHeader,UiBtnCopy
    },
    data: {
        employeeCode: "",
        identityCardNo: "",
        username: "",
        step: "",
        inviteUserMobile: "",
        childStep: "",
        ut: Vue.auth.getUserToken(),
        userInfo: null,
        datas: "",
        numbe: "",
        yuan: "",
        aboutData: [],//建一个空数组，用来保存调用接口获取的数据
        inviteUserLimit: "",
        invitedUserCount: "",
        surplus: "",
        hidden: false,
        shareLink: ""
    },
    ready: function () {
        this.checkHasvolunteer();
    },
    created: function () {
        this.getRoute(),
        this.already()
    },
    methods: {
        //会员限购
        getRoute: function () {
            var url = "/api/purchaseRule/memberLimitDetail";
            var params = {
                ut: Vue.auth.getUserToken(),
            }
            Vue.api.post(url, params, (res) => {
                // for (var i = 0; i < res.data.length; i++) {
                //     this.aboutData.push(res.data[i].totalCountLimit)
                //     this.aboutData.push(res.data[i].totalAmountLimit)
                // }
                if(res.code==0){
                   this.aboutData=res.data;
                }
            })
        },
        copy: function () {
            var url = "/api/share/shareInfo";
            var utValue = "";
            var params = {
                ut: utValue,
                type: 8,
                platformId: 3,
            }
            Vue.api.get(url, params, (res) => {
                this.shareLink = res.data.linkUrl + "&shareName=" + this.username;
            })
           
        },
        //获取已经邀请和剩余的人数
        already: function () {
            var url = "/ouser-web/api/user/getInviteMemberCountInfo.do";
            var params = {
                ut: Vue.auth.getUserToken(),
            }
            Vue.api.post(url, params, (res) => {
                if (res.code == 0) {
                    this.inviteUserLimit = res.inviteUserLimit
                    this.invitedUserCount = res.invitedUserCount
                    this.surplus = this.inviteUserLimit - this.invitedUserCount
                }
            })
        },
        register: function () {
            var param = {
                employeeNo: this.employeeCode,
                identityCardNo: this.identityCardNo,
                realName: this.realName,
                identityTypeCode: 41,
                ut: this.ut
            }

            if (!this.realName) {
                Vue.utils.showTips('请输入真实姓名');
                return;
            }

            if (!this.employeeCode) {
                Vue.utils.showTips('请输入员工号');
                return;
            }

            if (!this.identityCardNo || !this.identityCardNo.match(/(^\d{3}(\d|X|x)$)/)) {
                Vue.utils.showTips('请输入身份证后四位');
                return;
            }

            var url = "/ouser-center/api/user/member/applyMemberIdentity.do";
            Vue.api.postForm(url, param, (res) => {
                Vue.utils.showTips('申请成功');
                this.already()
                this.checkHasvolunteer();
                this.step = 2;
            }, (res) => {
                if (res.code == 6) {
                    Vue.utils.showTips('请校验输入参数');
                   
                } else {
                    Vue.utils.showTips(res.message);
                }

            });
        },

        //对用户状态进行验证
        checkHasvolunteer: function () {
            let params = {
                identityTypeCode: 4,
            }
            Vue.api.postForm("/ouser-center/api/user/info/detail.do", params, (res) => {
                this.userInfo = res.data;
                if (res.code == 0) {
                    if (res.data.memberInfo.memberTypeName == "内购会员") {
                        this.step = 2;
                        this.username = res.data.memberInfo.realName;
                        this.inviteUserMobile = res.data.userInfo.inviteUserMobile;
                        //被邀请人
                        if (res.data.userInfo.identityTypeCode == 4) {
                            this.childStep = 2;
                        } else if (res.data.userInfo.identityTypeCode == 41) {//邀请人
                            this.childStep = 1;
                        }
                        this.copy();
                        return;
                    }

                    if (res.data.memberInfo.memberTypeName == "普通会员") {
                        this.step = 1;
                        return;
                    } else {
                        Vue.utils.showTips('您还不是普通会员');
                        this.step = 3
                        return;
                    }
                }
            });
        }
    }


});
