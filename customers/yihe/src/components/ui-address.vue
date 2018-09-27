<template>
    <div class="address-container" :class="{'show': show}">
        <header class="ui-header ui-header-stable ui-border-b">
            <i class="ui-icon-return" @click="hideAddress"></i>
            <h1>{{id ? '编辑收货地址' : '新增收货地址'}}</h1>
            <a href="javascript:void(0)" v-if="id" class="handle" @click="deleteAddress">删除</a>
        </header>

        <section class="ui-container">
            <div class="ui-form">
                <form novalidate>
                    <div class="ui-form-item ui-form-item-pure ui-border-b">
                        <input type="text" placeholder="收货人姓名" maxlength="20" v-model="userName.value" @focus="userName.flag = true" @blur="inputBlur(userName)">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="userName.value.length > 0 && userName.flag == true" @click="userName.value = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b" v-if="overseas">
                        <input type="text" placeholder="身份证号（用于申报海购商品）" v-model="identityCardNumber.value" @focus="identityCardNumber.flag = true" @blur="inputBlur(identityCardNumber)">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="identityCardNumber.value.length > 0 && identityCardNumber.flag == true" @click="identityCardNumber.value = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b">
                        <input type="number" placeholder="联系方式" v-model="mobile.value" @focus="mobile.flag = true" @blur="inputBlur(mobile)">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="mobile.value.length > 0 && mobile.flag == true" @click="mobile.value = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b">
                        <input type="text" placeholder="所在地区" v-model="area" @click="showArea = true" readonly>
                    </div>
                    <div class="ui-form-item ui-form-item-pure ui-border-b">
                        <input type="text" placeholder="详细地址" maxlength="40" v-model="detailAddress.value" @focus="detailAddress.flag = true" @blur="inputBlur(detailAddress)">
                        <a href="javascript:void(0)" class="ui-icon-close" v-if="detailAddress.value.length > 0 && detailAddress.flag == true" @click="detailAddress.value = ''"></a>
                    </div>
                    <div class="ui-form-item ui-form-item-switch">
                        <p>设为默认地址<span class="padl10 f12 c6">注：每次下单时会使用该地址</span></p>
                        <label class="ui-switch">
                            <input type="checkbox" v-model="defaultIs">
                        </label>
                    </div>
                </form>
            </div>
            <div class="submit-btn">
                <button type="button" class="ui-btn ui-btn-primary cf" @click="submitForm()">{{ button ? button : '保存' }}</button>
            </div>
        </section>
        <!--省市区选择-->
        <ui-location :show.sync="showArea" :callback="callbackProvince"></ui-location>
    </div>
</template>
<script>
import Vue from "vue";
import config from "../../env/config.js";
import UiHeader from "./ui-header.vue";
import UiLocation from "./ui-location.vue";

export default {
    components: {
        UiHeader,
        UiLocation
    },
    data: function () {
        return {
            showArea: false,
            overseas:false,//海购标识
            userName: { //收货人姓名
                value: '',
                flag: false
            },
            identityCardNumber: { //身份证号
                value: '',
                flag: false
            },
            mobile: { //联系方式
                value: '',
                flag: false
            },
            area: '', //地区
            detailAddress: { //详细地址
                value: '',
                flag: false
            },
            defaultIs: false, //默认
            currentProvince: {
                id: -1,
                name: '请选择',
                code: ''
            },
            currentCity: {
                id: -1,
                name: '请选择',
                code:''
            },
            currentRegion: {
                id: -1,
                name: '请选择',
                code:''
            },
            errorTips: '' //提示信息
        };
    },
    props: ["id", 'show', 'backEvent', 'button', 'addSuccess'],
    watch: {
        "show": function (boo, oldBoo) {
            this.checkOverseas();
            if(boo && this.id && this.id) {//每次打开的时候，判断id，查询地址详情
                this.getAddressInfo();
            }else {
                this.showArea = false,
                this.userName.value = '';
                this.userName.flag = false;
                this.identityCardNumber.value = '';
                this.identityCardNumber.flag = false;
                this.mobile.value = '';
                this.mobile.flag = false;
                this.area = '', //地区
                this.detailAddress.value = '';
                this.detailAddress.flag = false;
                this.defaultIs = false;
                this.currentProvince.id = -1;
                this.currentProvince.name = '请选择';
                this.currentProvince.code = '';
                this.currentCity.id = -1;
                this.currentCity.name = '请选择';
                this.currentCity.code = '';
                this.currentRegion.id = -1;
                this.currentRegion.name = '请选择';
                this.currentRegion.code = '';
                this.errorTips = '';
            }
        }
    },
    methods: {
        //返回
        hideAddress: function (id) {
            alert(123);
            this.show = false;
            if(typeof this.backEvent == 'function') {
                this.backEvent(id);
            }
        },
        //海购标识
        checkOverseas: function () {
            var params = { data: { companyId: Vue.mallSettings.getCompanyId(), mainModule:"OVERSEAS_MODULE",subModule:""} };
            Vue.api.post("/osc-api/getModuleController.do", params, (result) => {
                this.overseas = result.resultData == 1;
            });
        },
        //选择省市区回调
        callbackProvince: function (po) {
            this.currentProvince.id = po.pid;
            this.currentProvince.name = po.pname;
            this.currentProvince.code = po.pcode;
            this.currentCity.id = po.cid;
            this.currentCity.name = po.cname;
            this.currentCity.code = po.ccode;
            this.currentRegion.id = po.rid;
            this.currentRegion.name = po.rname;
            this.currentRegion.code = po.rcode;
            this.area = po.pname + ' ' + po.cname + ' ' + po.rname;
        },
        //查询地址详情
        getAddressInfo: function() {
            var params = {
                ut: Vue.auth.getUserToken()
            };
            Vue.api.postForm(config.ouserHost + '/ouser-web/address/getAllAddressForm.do', params, (res) => {
                if (res.data) {
                    for (var i = 0; i < res.data.length; i++) {
                        if (res.data[i].id == this.id) {
                            this.userName.value = res.data[i].userName;
                            this.identityCardNumber.value = res.data[i].identityCardNumber;
                            this.mobile.value = res.data[i].mobile;
                            this.detailAddress.value = res.data[i].detailAddress;
                            this.currentProvince.name = res.data[i].provinceName;
                            this.currentCity.name = res.data[i].cityName;
                            this.currentRegion.name = res.data[i].regionName;

                            this.currentProvince.code = res.data[i].provinceCode;
                            this.currentCity.code = res.data[i].cityCode;
                            this.currentRegion.code = res.data[i].regionCode;

                            this.currentProvince.id = res.data[i].provinceCode;
                            this.currentCity.id = res.data[i].cityId;
                            this.currentRegion.id = res.data[i].regionId;
                            this.defaultIs = res.data[i].defaultIs == 0 ? false : true;
                            this.area = this.currentProvince.name + ' ' + this.currentCity.name + ' ' + this.currentRegion.name;
                        }
                    }
                }
            });
        },
        //校验表单
        checkMobile: function() {
            var patternMobile = /^(13|15|17|18|14)[0-9]{9}$/;
            if (this.userName.value == '' || this.userName.value.trim().length == 0) {
                this.showTipsPop('请输入收货人姓名');
                return false;
            }
            if(!(/^[\u4e00-\u9fa5]*$/.test(this.userName.value))){
                this.showTipsPop("仅支持20个字符以内的中文");
                return false;
            }
            if(this.userName.value.match("男士")||this.userName.value.match("女士")||this.userName.value.match("先生")||this.userName.value.match("小姐")){
                this.showTipsPop("不能有男士、先生、女士、小姐字样");
                return false;
            }
            if(this.overseas){
            var patternIdCardNum = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;  
                if (this.identityCardNumber.value=='' || this.identityCardNumber.value.length> 0 && !patternIdCardNum.test(this.identityCardNumber.value)) {
                this.showTipsPop('请输入正确的身份证号');
                return false;
                }
            }
            if (this.mobile.value == '') {
                this.showTipsPop('请输入联系方式');
                return false;
            }
            if (!this.area || this.area.indexOf('请选择') > 0) {
                this.showTipsPop('请选择区域');
                return false;
            }
            if (this.detailAddress.value == '') {
                this.showTipsPop('请输入详细地址');
                return false;
            } else if (!patternMobile.test(this.mobile.value)) {
                this.showTipsPop('请输入正确的联系方式');
                return false;
            } else {
                return true;
            }

        },
        //失去焦点
        inputBlur: function(obj) {
            setTimeout(function() {
                obj.flag = false
            }, 50);
        },
        //显示提示弹框
        showTipsPop: function(tips, callback) {
            var el = $.tips({
                content: tips,
                stayTime: 2000,
                type: "warn"
            })
            el.on("tips:hide", ()=> {
                if(typeof callback == 'function') {
                    callback();
                }
            })
        },
        //删除地址
        deleteAddress: function() {
            var dialog = $.dialog({
                title: "",
                content: "确定要删除地址吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    var params = {
                        id: this.id,
                        defaultIs: this.defaultIs ? 1 : 0,
                        ut: Vue.auth.getUserToken()
                    };
                    Vue.api.postForm(config.ouserHost + '/ouser-web/address/deleteAddressForm.do', params, (res) => {
                        var el = $.tips({
                            content: '删除成功',
                            stayTime: 2000,
                            type: "success"
                        })
                        this.hideAddress();
                    });
                }
            });
        },
        //保存
        saveAddress: function() {
            if (this.checkMobile()) {
                var param = {
                    ut: Vue.auth.getUserToken(),
                    userName: this.userName.value,
                    identityCardNumber: this.identityCardNumber.value,
                    mobile: this.mobile.value,
                    detailAddress: this.detailAddress.value,

                    provinceId: this.currentProvince.id,
                    cityId: this.currentCity.id,
                    regionId: this.currentRegion.id,

                    provinceCode: this.currentProvince.id,
                    cityCode:this.currentCity.code,
                    regionCode:this.currentRegion.code,
                    defaultIs: this.defaultIs ? 1 : 0
                };
                Vue.api.postForm(config.ouserHost + '/ouser-web/address/addAddressForm.do', param, (res) => {
                    this.showTipsPop('新建地址成功！');
                    setTimeout(() => {
                        this.hideAddress(res.id);
                        //成功回调事件
                        if(typeof this.addSuccess == 'function') {
                            this.addSuccess(res.id);
                        }
                    });
                });
            }
        },
        //更新地址
        updAddress: function() {
            if (this.checkMobile() && this.id) {
                var params = {
                    id: this.id,
                    ut: Vue.auth.getUserToken(),
                    userName: this.userName.value,
                    identityCardNumber: this.identityCardNumber.value,
                    mobile: this.mobile.value,
                    detailAddress: this.detailAddress.value,
                    provinceId: this.currentProvince.id,
                    cityId: this.currentCity.id,
                    regionId: this.currentRegion.id,

                    provinceCode: this.currentProvince.id,
                    cityCode:this.currentCity.code,
                    regionCode:this.currentRegion.code,
                    defaultIs: this.defaultIs ? 1 : 0
                };
                Vue.api.postForm(config.ouserHost + '/ouser-web/address/updateAddressForm.do', params, (res) => {
                    this.showTipsPop('更新地址成功！');
                    setTimeout(() => {
                        this.hideAddress();
                    }, 2000);
                });
            }
        },
        //提交
        submitForm: function () {
            if(this.id) {
                this.updAddress();
            }else {
                this.saveAddress();
            }
        }
    }
}
</script>
