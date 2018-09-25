import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheet from "../../components/ui-actionsheet.vue";
import UiLocation from "../../components/ui-location.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import UiEdit from "../../components/ui-edit.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader, UiActionsheet, UiLocation, UiFileUpload, UiEdit },
    data: {
        showHeadMenu: false, //显示头像操作菜单
        showSexSwitch: false,
        showBirthDay: false,
        showArea: false,
        isEditStatus: 0,
        showEdit: false,
        type: '',
        headPicUrl: '${staticPath}/images/no-header.png?v=${version}', //头像
        userInfo: {

        }, //用户信息
        userInfoOld: '', //服务器上获取的用户信息
        isApp: Vue.browser.isApp(),

        isNeedIdentity:true,//配置 是否需要实名认证功能
        identityStatus:7,//实名认证状态
        isIdentityTipsWords:'立即认证',//认证入口提示语
        idInfo:{},//认证的信息
    },
    ready: function() {
        this.getUserInfo();
        this.ifNeedIdentity();
        // this.ifIdentity();
    },
    methods: {
        //图片上传成功
        uploadSuccess: function(data) {
            this.headPicUrl = data.filePath;
            this.updUserPic();
            // // 修改头像后，清除分销商信息缓存,使首页头像刷新
            //Vue.distribution.clearCurrentDistributionData();
        },
        //获取用户信息
        getUserInfo: function() {
            var url = config.apiHost + '/api/my/user/info';
            var param = {
                ut: Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId()
            };
            Vue.api.postForm(url, param, (res) => {
                this.userInfo = res.data;
                this.headPicUrl = res.data.url100x100;
                this.userInfoOld = JSON.stringify(res.data);
                $('#picktime').val(res.data.birthdayStr);
            });
        },
        //更新用户头像
        updUserPic: function() {
            var url = config.apiHost + '/api/my/user/updateInfo';
            var param = {
                ut: Vue.auth.getUserToken(),
                headPicUrl: this.headPicUrl
            };
            Vue.api.postForm(url, param, (res) => {
                this.isEditStatus = 0;
                $.tips({
                    content: '头像修改成功',
                    stayTime: 2000,
                    type: "warn"
                })
            });
        },
        chooseArea: function (po) {
            this.userInfo.userProvince = po.pname;
            this.userInfo.userCity = po.cname;
            this.userInfo.userRegion = po.rname;

            this.userInfo.userProvinceCode = po.pcode;
            this.userInfo.userCityCode = po.ccode;
            this.userInfo.userRegionCode = po.rcode;

            var url = config.apiHost + '/api/my/user/updateInfo';
            var param = {
                ut: Vue.auth.getUserToken(),
                headPicUrl: '',
                nickname: '',
                identityCardName: '',
                sex: '',
                birthday: '',
                userProvinceCode: this.userInfo.userProvinceCode,
                userCityCode: this.userInfo.userCityCode,
                userRegionCode: this.userInfo.userRegionCode,
                userProvince: this.userInfo.userProvince,
                userCity: this.userInfo.userCity,
                userRegion: this.userInfo.userRegion,
                telephone: '',
                email: '',
                remarks: '',
                zipCode:'',
                userAddress:''
            };
            Vue.api.postForm(url, param, (res) => {
                this.getUserInfo();
                Vue.utils.showTips("保存成功");
            });


        },
        //更新用户信息
        updUserInfo: function() {
            //比较用户信息是否修改
            var uiStr = JSON.stringify(this.userInfo);
            if (uiStr === this.userInfoOld) { //未修改
                this.isEditStatus = 0;

                return;
            }
            if (this.userInfo.nickname && !/^[0-9a-zA-Z\u2E80-\u9FFF]+$/.test(this.userInfo.nickname)) {
                $.tips({
                    content: '昵称不能输入特殊字符',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }
            if (this.userInfo.identityCardName && !/^[0-9a-zA-Z\u2E80-\u9FFF]+$/.test(this.userInfo.identityCardName)) {
                $.tips({
                    content: '姓名不能输入特殊字符',
                    stayTime: 2000,
                    type: "warn"
                })
                return;
            }
            if (this.userInfo.telephone && !/((\d{11})|^((\d{7,8})|(\d{4}|\d{3})-(\d{7,8})|(\d{4}|\d{3})-(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1})|(\d{7,8})-(\d{4}|\d{3}|\d{2}|\d{1}))$)/.test(this.userInfo.telephone)) {
                $.tips({
                    content: '请输入固定电话或手机号',
                    stayTime: 2000,
                    type: "warn"
                })
                return;
            }
            if (this.userInfo.email && !/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/.test(this.userInfo.email)) {
                $.tips({
                    content: '邮箱格式有误',
                    stayTime: 2000,
                    type: "warn"
                })
                return;
            }

            var url = config.apiHost + '/api/my/user/updateInfo';
            var param = {
                ut: Vue.auth.getUserToken(),
                headPicUrl: this.userInfo.headPicUrl,
                nickname: this.userInfo.nickname,
                identityCardName: this.userInfo.identityCardName,
                sex: this.userInfo.sex,
                birthday: this.userInfo.birthdayStr,
                userProvince: this.userInfo.userProvince,
                userCity: this.userInfo.userCity,
                userRegion: this.userInfo.userRegion,
                telephone: this.userInfo.telephone,
                email: this.userInfo.email,
                remarks: this.userInfo.remarks,
                userAddress:''
            };
            Vue.api.postForm(url, param, (res) => {
                this.isEditStatus = 0;
                Vue.utils.showTips("资料修改成功");
            });
        },
        //选择性别
        switchSex: function(sex) {
            this.userInfo.sex = sex;
            this.showSexSwitch = false;
        },
        //返回事件
        backEvent: function() {
            if (this.isEditStatus) {
                var dialog = $.dialog({
                    title: "",
                    content: "放弃保存已修改的资料吗？",
                    button: ["取消", "确认"]
                });
                dialog.on("dialog:action", (e) => {
                    //点击确定按钮
                    if (e.index == 1) {
                        this.back();
                    }
                });
            } else {
                this.back();
            }
        },
        back: function () {
            if (this.isApp) {
                Vue.app.back();
            } else {
                history.back();
            }

        },
        //新增或编辑
        edit: function(id) {
            this.showEdit = true;
            if (userNameFlag == false) {

            }

        },

        // 判断此系统是否需要实名认证
        ifNeedIdentity:function () {
            var url = config.apiHost + '/api/commondata/getConfig';
            var param = {
            };
            Vue.api.get(url,param,(res) => {
                if(res.data.realNameRequired == 1){
                    this.isNeedIdentity = true;
                    this.ifIdentity();
                }else{
                    this.isNeedIdentity = false;
                }
            },() => {
            });
        },
        // 是否已实名认证
        ifIdentity: function () {
            var url = config.apiHost + '/ouser-center/realNameAuth/getRealNameAuthInfo.do';
            var param = {
                ut: Vue.auth.getUserToken(),
            };
            Vue.api.postForm(url, param, (res) => {
                this.identityStatus = res.data.authStatus;// -1未提交认证，3认证失败  0已提交待审核，1待认证，2认证成功
                if(this.identityStatus == 0){
                    // 已提交待审核
                    this.isIdentityTipsWords = "已提交待审核";
                }else if(this.identityStatus == 2){
                    // 认证成功
                    this.isIdentityTipsWords = "已认证";
                }else if(this.identityStatus == 3){
                    // 认证失败
                    this.isIdentityTipsWords = "认证失败";
                }else if(this.identityStatus == 1){
                    // 1待认证
                    this.isIdentityTipsWords = "待认证";
                }else{
                    // 未提交认证
                    this.isIdentityTipsWords = "立即认证";
                }
                this.idInfo = res.data;
            },() => {
                // 异常返回
                this.identityStatus = 7;
            });
        },
        // 点击实名认证跳转
        identityGoto:function () {
            if(this.identityStatus == 3 || this.identityStatus == -1){
                //可编辑
                document.location.href='/my/authentication.html' + '?isEdit=' + 1;
            }else if(this.identityStatus == 0 || this.identityStatus == 1|| this.identityStatus == 2){
                //不可编辑
                document.location.href='/my/authentication.html' +  '?isEdit=' + 0;
            }else{
                // 异常返回，不做处理
            }
            // window.location.href = "/my/authentication.html"
        },

    }
});
