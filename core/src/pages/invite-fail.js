import Vue from "vue";
import UiHeader from "../components/ui-header.vue";
import config from "../config/default.js";

new Vue({
    el: 'body',
    components: {
        UiHeader
    },
    data:{    
       message: Vue.cookie.getCookie("shareMessageTip"),
       defaultMessage: '邀请失败'
    },
    methods:{
    	goback:function(){
    		 location.href = "/index.html";
    	}
    	
    }
});