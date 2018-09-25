import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../../env/config.js";
let urlParams = Vue.utils.paramsFormat(window.location.href);
new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        mpId:urlParams.mpId,
        name:urlParams.name,
        showPhone:true,
        mobile:'',
        initData:{}
    },
    ready: function() {
        this.initAttentionMerchat();
    },
    methods: {
        // 初始化商品信息和用户手机号
        initAttentionMerchat:function () {
            var params={
                // mpId:1049011601000578,
                mpId:this.mpId,
                ut:this.ut,
            };
            Vue.api.get("/api/attention/initAttentionMerchantProduct",params ,(res)=>{
                this.initData = res.data;
                this.mobile = res.data.mobile;
            })
        },
        // 到货通知
        getAttentionMerchant:function(){
            if(!this.mobile) {
                $.tips({
                    content: '请输入手机号',
                    stayTime: 2000,
                    type: "warn"
                });
                return;
            }

            var userMobile="";
            if(this.mobile){
                if(this.mobile != this.initData.mobile){
                    if(!/^[0-9]{11}$/.test(this.mobile)) {
                        $.tips({
                            content: '请输入11位有效手机号',
                            stayTime: 2000,
                            type: "warn"
                        });
                        return;
                    }
                    userMobile=this.mobile;
                }
            }

            var params={
                mpId:this.mpId,
                pushType:2,
                ut:this.ut,
                mobile:userMobile
            };
            Vue.api.postForm("/api/attention/attentionMerchantProduct",params ,(res)=>{
                // var phone = $("#phone").text();
                // var mphone = phone.substr(0, 3) + '****' + phone.substr(7);
                // $('#phone').text(mphone);
                $.tips({
                    content: '您已成功设置到货通知',
                    stayTime: 2000,
                    type: "warn"
                });
				setTimeout(() => {
					history.back();
				}, 2000);
            })
        },
        // 是否发送短信通知
        ifSendMsg:function () {
            if(this.showPhone){
                this.getAttentionMerchant();
            }else{
                
            }
        }
    }
});
