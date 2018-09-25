import Vue from "vue";
import config from "../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    data: {
        jumpPage: '',
        wakeupUrl: ''
    },
    ready: function() {
        //url params
        //distributorId 分销商家id,
        //type是那个页面|type|Integer|分享类型。1是首页，2是商品详情页，3是品牌搜索页
        //paramId|Long|type为1时不用传，为2时传mpId，为3时传brandId|否|
        this.getDistributorId();
    },
    methods: {
        //获取分销商ID
        getDistributorId: function () {
            if(urlParams.distributorId) {
                //存储分销商ID
                Vue.auth.setDistributorId(1, urlParams.distributorId);               
            }
            if (urlParams.shareCode) {
            	// Vue.cookie.setCookie('shareCode', urlParams.shareCode);
            }
            this.jumpToPage();
        },
        //跳转至对应页面
        jumpToPage: function () {
            switch (urlParams.type) {
                case "1":
                    this.jumpPage = "/index.html";
                    this.wakeupUrl = 'saas://home?distributeId='+urlParams.distributorId + '&shareCode=' + urlParams.shareCode;
                    break;
                case "2":
                    this.jumpPage = "/detail.html?itemId="+urlParams.paramId;
                    this.wakeupUrl = 'saas://detail?mpId='+urlParams.paramId + '&distributeId=' + urlParams.distributorId + '&shareCode=' + urlParams.shareCode;
                    break;
                case "3":
                    this.jumpPage = "/brand-list.html?brandIds="+urlParams.paramId;
                    this.wakeupUrl = 'saas://brand?brandId='+urlParams.paramId + '&distributeId=' + urlParams.distributorId + '&shareCode=' + urlParams.shareCode;
                    break;
                case "4":
                    var url = '/cms/view/h5/article/'+urlParams.paramId+'.html';
                    this.jumpPage = url;
                    this.wakeupUrl = 'saas://h5?linkUrl='+url + '&distributeId=' + urlParams.distributorId + '&shareCode=' + urlParams.shareCode
                    break;
                case "5":
                    this.jumpPage = "/my/market-article-detail.html?share=1&id="+urlParams.paramId;
                    this.wakeupUrl = 'saas://marketingSpread?articleId='+urlParams.paramId + '&distributeId=' + urlParams.distributorId + '&shareCode=' + urlParams.shareCode;
                    break;
                case "7":
                    this.jumpPage = "/regis.html?inviting=1"+urlParams.paramId;
                    this.wakeupUrl = "/regis.html?inviting=1"+urlParams.paramId;
                    break;
                case "8":
	                if (urlParams.shareCode) {
		            	Vue.cookie.setCookie('shareCode8', urlParams.shareCode);
		            }
                	this.jumpPage = "login.html?shareCode="+urlParams.shareCode+"&shareName="+urlParams.shareName;             
                    this.wakeupUrl = "login.html?shareCode="+urlParams.shareCode+"&shareName="+urlParams.shareName;          
                    break;
                default:
                    this.jumpPage = "/index.html";
                    this.wakeupUrl = 'saas://home?distributeId='+urlParams.distributorId + '&shareCode=' + urlParams.shareCode;
            }
            
            if(!Vue.browser.isApp()) {
                setTimeout(() => {//3秒后打开H5页面
                    window.location.href = this.jumpPage;    
                }, 3000);
            }else{
                document.location = this.wakeupUrl;
            }         	
        },
        //如果是在微信或者qq浏览器打开，显示友好界面
        showPrompt: function () {
            //目前不判断浏览器，直接打开页面
        }
    }
});