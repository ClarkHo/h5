import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../config/default.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{    
        username :"",
        step:"",
        childStep: "",
        inviteUserMobile:"",
        aboutData:[],//建一个空数组，用来保存调用接口获取的数据
      
    },
    ready:function(){
        this.checkHasvolunteer();   
    },

   created: function () {
       this.getRoute(),
       this.checkHasvolunteer()
   }, 
    methods:{
    		//登录成功返回首页
    		goback:function(){
    		 location.href = "/index.html";
    	},
    		
        //会员限购
        getRoute:function(){    
            var url="/api/purchaseRule/memberLimitDetail";
              var params={
                   ut: Vue.auth.getUserToken(),  
               }
              Vue.api.post(url, params, (res) => {                    
                if(res.code==0){
                    this.aboutData=res.data;
                 }
             })           
        },
         checkHasvolunteer:function(){
            let params = {
                identityTypeCode:4,
            }
            Vue.api.postForm("/ouser-center/api/user/info/detail.do", params, (res) => {
                this.userInfo = res.data;
                    // console.log(res.data.userInfo.inviteUserMobile)
                if(res.code == 0 ){
                    if(res.data.memberInfo.memberTypeName == "内购会员") {
                        this.step = 2;
                        this.username = res.data.memberInfo.realName;
                        if(!this.username){
                            this.username = res.data.userInfo.inviteUserMobile;
                        }
                        
                    
                        //被邀请人
                        if (res.data.userInfo.identityTypeCode == 4) {
                        	this.childStep = 2;
                        } else if(res.data.userInfo.identityTypeCode == 41){//邀请人
                        	this.childStep = 1;       	                   	
                        }
                        return;
                    }

                    if(res.data.memberInfo.memberTypeName == "普通会员") {
                        this.step=1;
                        return;
                    }else{
                        Vue.utils.showTips('您还不是普通会员');
                        this.step = 3
                        return;
                    }
                }
            });
        }
    }


});
