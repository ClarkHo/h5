import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiActionsheetPop from "../../components/ui-actionsheet-pop.vue";
import UiImageViewer from "../../components/ui-image-viewer.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiActionsheetPop,UiImageViewer },
    data: {
        merchantId: urlParams.merId || 336,
        hIndex: urlParams.hIndex,
        shopInfo: '',
        showPhone:false,
        rightNavFlag:false,
        indexInfo:'',
        hasFavorite:false,
        showFullPic:false,//显示证照信息预览
        itemImages:[],//预览图
    },
    created() {
        this.getShopInfo()
    },
    ready: function() {
        this.getIndex();
        if(Vue.auth.getUserToken()){
            this.getfavorite();
        }
    },
    methods: {
        
        // 是否有首页
        getIndex:function(){
            var url = '/cms/page/getMerIndexPage';
            var param = {
                merchantId: this.merchantId
            }
            Vue.api.get(url, param, (res) => {
                this.indexInfo = res.data
            })
        },
        //店铺基本信息
        getShopInfo: function(){
            let url = `/back-merchant-web/shop/baseInfo.do`
            let params = {
                merchantId: this.merchantId,
            }
            Vue.api.get(url, params, (result) => {
                if(result.data){
                    this.shopInfo = result.data;
                    this.itemImages = result.certificateFiles || [];
                }
            });
        },
        //是否收藏
        getfavorite: function (params) {
            var url = '/ouser-center/api/favorite/check.do';
            var params = {
                ut:Vue.auth.getUserToken(),
                type: 3,
                entityId: this.merchantId
            }
            Vue.api.postForm(url, params, (res) => {
                this.hasFavorite = res.isFavorite;
            })
        },
        //收藏
        addFavorite: function () {
            Vue.utils.goLogin();
            let param = {
                ut: Vue.auth.getUserToken(),
                type:'3',
                entityId: this.merchantId
            }
            let url = config.apiHost + "/ouser-center/api/favorite/add.do";
            Vue.api.postForm(url, param, (result) => {
                Vue.utils.showTips('收藏成功');
                this.getfavorite();
                this.getShopInfo();
            })

        },
        //取消
        delFavorite: function () {
            let param = {
                ut: Vue.auth.getUserToken(),
                type:'3',
                entityId: this.merchantId
            }
            let url = config.apiHost + "/ouser-center/api/favorite/delete.do";
            Vue.api.postForm(url, param, (result) => {
                Vue.utils.showTips('取消收藏成功');
                this.getfavorite();
                this.getShopInfo();
            })

        }
    },
    filters: {
        countFliter: function (num) {
            if (num > 9999) {
                var _value = (Math.floor((num * 10) / 10000) / 10).toFixed(1);
                return `${_value}万`
            } else {
                return num
            }
        }
    }
});
