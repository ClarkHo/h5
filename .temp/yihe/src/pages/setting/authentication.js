import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiDialogCaptchas from "../../components/ui-dialog-captchas.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiDialogCaptchas,UiActionsheet },
    data: {
        title: '身份验证',
        step: 0,                    //步骤
        oldsmsBtn: '获取验证码',    //旧验证码按钮value
        oldsmsBtnDisabled: false,   //旧验证码按钮禁用
        oldvicodeDialog: false,     //旧显示图片验证码
        smsBtn: '获取验证码',       //验证码按钮value
        smsBtnDisabled: false,      //验证码按钮禁用
        vicodeDialog: false,        //显示图片验证码
        sbmDisabled: false,         //防止重复提交
        user: {
            oldmobile: '',          //旧手机号
            showMobile: '',         //显示的手机号码
            oldcaptchas: '',        //旧手机验证码
            mobile: '',             //手机号
            captchas: ''            //验证码
        },
        showServicesCall: false
    },
    ready: function() {
        this.getBoundMobile();
    },
    methods: {
        //返回事件
        backStep: function () {
            if(this.step == 0) {
                history.back();
            }else {
                this.title = '身份验证';
                this.step = 0;
            }
        },
        //获取绑定手机
        getBoundMobile: function () {
            var url = config.apiHost + '/api/my/user/getBoundMobile?ut=' + Vue.auth.getUserToken() + '&' + new Date().getTime();
            Vue.api.get(url, null, (res) => {
                this.user.oldmobile = res.data.mobile;
                //this.user.showMobile = tel.substring(0,3) + "****" + tel.substring(7,11);
            });
        },
        //显示图片验证码
        oldShowImgViCode: function () {
            if(!this.user.oldmobile) {
                //console.log('异常情况');
            }
            this.oldvicodeDialog = true;
        },
        //下一步，验证验证码
        valiCaptchas: function () {
            if(!this.user.oldcaptchas || !/^[0-9]{4,6}$/.test(this.user.oldcaptchas)) {
                $.tips({
                    content: '请输入短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            var url = config.ouserHost + '/ouser-web/mobileRegister/checkCaptchasForm.do';
            var param = {
                mobile: this.user.oldmobile,
                captchas: this.user.oldcaptchas,
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.postForm(url, param, (res) => {
                this.title = '修改手机';
                this.step = 1;
            });
        },
        //显示图片验证码
        showImgViCode: function () {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            //校验手机号是否已注册
            var url = config.ouserHost + '/ouser-web/mobileRegister/isRepeatPhoneForm.do';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                mobile: this.user.mobile
            };
            Vue.api.postForm(url, param, (res) => {
                //手机号未绑定
                this.vicodeDialog = true;
            })
        },
        //绑定新手机号
        bindMobile: function () {
            if(!this.user.mobile || !/^[0-9]{11}$/.test(this.user.mobile)) {
                $.tips({
                    content: '请输入正确的手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if(!this.user.captchas || this.user.captchas.length != 6) {
                $.tips({
                    content: '请输入6位短信验证码',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            var url = config.ouserHost + '/ouser-web/mobileRegister/checkMobileAndModifyMobileForm.do';
            var param = {
                ut: Vue.auth.getUserToken(),
                orgianlMobile: this.user.oldmobile,
                mobile: this.user.mobile,
                captchas: this.user.captchas,
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.postForm(url, param, (res) => {
                $.tips({
                    content: '绑定成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.getBoundMobile();
                this.user.oldmobile = '';
                this.user.oldcaptchas = '';
                this.user.mobile = '';
                this.user.captchas = '';
                this.step = 0;
            });
        }
    }
});
