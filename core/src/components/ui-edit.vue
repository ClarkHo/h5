<template>
    <div class="address-container" :class="{'show': show}">
        <header class="ui-header ui-header-stable ui-border-b">
            <i class="icons4 icons4-back" @click="hideEdit"></i>
            <h1 v-if="type == 'nickname'" class="c3">编辑昵称</h1>
            <h1 v-if="type == 'email'"class="c3">编辑邮箱</h1>
            <h1 v-if="type == 'userAddress'"class="c3">编辑地址</h1>
            <h1 v-if="type == 'zipCode'"class="c3">编辑邮编</h1>
            <a href="javascript:void(0)"  class="handle" @click="updUserInfo">确认</a>
        </header>

        <section class="ui-container">
            <div class="ui-form">
                <form novalidate>
                    <div class="ui-form-item ui-form-item-pure ui-border-b"  v-if="type == 'nickname'">
                        <input type="text" placeholder="昵称" maxlength="20" v-model="userInfo.nickname">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="userInfo.nickname.length > 0" @click="userInfo.nickname = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b" v-if="type == 'email'">
                        <input type="text" placeholder="邮箱" maxlength="50" v-model="userInfo.email">
                        <a href="javascript:void(0)" class="ui-icon-close"
                           v-if="userInfo.email.length > 0" @click="userInfo.email = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b" v-if="type == 'zipCode'">
                        <input type="tel" placeholder="邮编" maxlength="6" v-model="userInfo.zipCode">
                        <a href="javascript:void(0)" class="ui-icon-close"
                           v-if="userInfo.zipCode.length > 0" @click="userInfo.zipCode = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b" v-if="type == 'userAddress'">
                        <input type="text" placeholder="详细地址" maxlength="40" v-model="userInfo.userAddress">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="userInfo.userAddress.length > 0" @click="userInfo.userAddress = ''"></a>
                    </div>
                </form>
            </div>
        </section>
    </div>
</template>
<script>
    import Vue from "vue";
    import config from "../../env/config.js";

    export default {
        props: ['show', 'backEvent', 'userInfo', 'type'],

        methods: {
            //返回
            hideEdit: function () {
                this.show = false;
                if(typeof this.backEvent == 'function') {
                    this.backEvent();
                }
            },
            //校验表单
            checkMobile: function() {
                if (this.type == 'nickname' && this.userInfo.nickname == '') {
                    this.showTipsPop('请输入昵称');
                    return false;
                }
                var patternEmail = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/;
                if (this.type == 'email' && this.userInfo.email == '') {
                    this.showTipsPop('请输入邮箱');
                    return false;
                }else if (this.userInfo.email && !patternEmail.test(this.userInfo.email)) {
                    this.showTipsPop('请输入正确的邮箱');
                    return false;
                }
                var patternZipCode =  /^[1-9][0-9]{5}$/;
                if (this.type == 'zipCode' &&this.userInfo.zipCode == '') {
                    this.showTipsPop('请输入邮编');
                    return false;
                }else if(this.type == 'zipCode' &&this.userInfo.zipCode && !patternZipCode.test(this.userInfo.zipCode)){
                    this.showTipsPop('请输入正确的邮编');
                    return false;
                }
                if (this.type == 'userAddress' &&this.userInfo.userAddress == '') {
                    this.showTipsPop('请输入详细地址');
                    return false;
                }
                return true;
            },
            //显示提示弹框
            showTipsPop: function(tips, callback) {
                var el = $.tips({
                    content: tips,
                    stayTime: 2000,
                    type: "warn"
                })
                el.on("tips:hide", ()=> {
                    if(typeof callback == 'function'){
                        callback()
                    }
                });
            },
            //确认
            updUserInfo:function () {
                if (this.type == 'nickname' && this.userInfo.nickname == '') {
                    this.showTipsPop('请输入昵称');
                    return false;
                }
                var patternEmail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
                if (this.type == 'email' && this.userInfo.email == '') {
                    this.showTipsPop('请输入邮箱');
                    return false;
                }else if (this.userInfo.email && !patternEmail.test(this.userInfo.email)) {
                    this.showTipsPop('请输入正确的邮箱');
                    return false;
                }
                var patternZipCode = /^[1-9]\d{5}$/;
                if (this.type == 'zipCode' &&this.userInfo.zipCode == '') {
                    this.showTipsPop('请输入邮编');
                    return false;
                }else if(this.type == 'zipCode' &&this.userInfo.zipCode && !patternZipCode.test(this.userInfo.zipCode)){
                    this.showTipsPop('请输入正确的邮编');
                    return false;
                }
                if (this.type == 'userAddress' && this.userInfo.userAddress == '') {
                    this.showTipsPop('请输入详细地址');
                    return false;
                }
                    var url = config.apiHost + '/api/my/user/updateInfo';
                    var param = {
                        ut: Vue.auth.getUserToken(),
                        headPicUrl: this.userInfo.headPicUrl,
                        nickname: this.userInfo.nickname,
                        identityCardName: this.userInfo.identityCardName,
                        sex: this.userInfo.sex,
                        birthday: this.userInfo.birthdayStr,
                        userProvince: this.userInfo.userProvince || '',
                        userCity: this.userInfo.userCity || '',
                        userRegion: this.userInfo.userRegion || '',
                        telephone: this.userInfo.telephone,
                        email: this.userInfo.email,
                        remarks: this.userInfo.remarks,
                        zipCode:this.userInfo.zipCode,
                        userAddress:this.userInfo.userAddress
                    };
                    Vue.api.postForm(url, param, (res) => {
                       // this.isEditStatus = 0;
                       if (Vue.browser.isApp()) {
                            //通知app刷新个人中心页面
                            Vue.app.postMessage("pageRefresh");
                        }
                       // console.log(this.userInfo.userAddress);
                       Vue.utils.showTips("资料修改成功");
                });
                    this.show = false;
                }
            }

    }
</script>