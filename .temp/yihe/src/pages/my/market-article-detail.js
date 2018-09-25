import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiShare from "../../components/ui-share.vue";
import config from "../../../env/config.js";

let urlParams = Vue.utils.paramsFormat(window.location.href);

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiShare },
    data: {
        articleId: urlParams.id,
        details: {},
        showShare: false,   //分享显示隐藏
        shareConfig: null,  //分享配置
        shareBackUrl: urlParams.share == 1 ? '/index.html' : 'javascript:history.back()'
    },
    ready: function() {
        this.getArticleDetail();
    },
    methods: {
        //获取文章详情
        getArticleDetail: function(){
            var params = {
                ut:Vue.auth.getUserToken(),
                //ut: '8582ccd17bf1429eadbb70abaabdc6e8',
                companyId: Vue.mallSettings.getCompanyId(),
                id: this.articleId
            };
            Vue.api.get("" + "/api/social/live/article/detail", params, (result) => {
                this.details = result.data || {};//防止后台返回空报错
            });
        },
        //点击分享
        clickShare: function () {
            if(!Vue.auth.loggedIn()) {//如果没有登录 需要先登录 为了获取自家did
                var from = Vue.utils.getRelatedUrl();
                window.location.href = "/login.html?from=" + encodeURIComponent(from);
                return;
            }
            //获取分享信息
            var url = "" + '/api/social/live/article/share';
            var param = {
                companyId: Vue.mallSettings.getCompanyId(),
                id: this.articleId,
                ut: Vue.auth.getUserToken()
            };
            Vue.api.get(url, param, (res) => {
                this.shareConfig = {
                    url: res.data.linkUrl,
                    title: res.data.title,
                    description: res.data.content,
                    pic: res.data.sharePicUrl
                };
                this.showShare = true;
            });
        }
    }
});