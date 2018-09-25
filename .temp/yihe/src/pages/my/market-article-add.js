import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";

var aid = Vue.utils.paramsFormat(window.location.href).id;

var vm = new Vue({
    el: 'body',
    components: { UiHeader,UiFileUpload},
    data: {
        aid: aid,
        showActionSheet: false,
        title: '',//标题
        content: '',//内容
        oldStr: ''
    },
    ready: function() {
        $('#editPanel').focus(function () {
            $('#tip').remove();
        });

        if(this.aid) {
            this.getArticleContent();
        }
    },
    methods: {
        //校验
        checkForm: function(){
            if(!this.title) {
                $.tips({
                    content: '请输入文章标题',
                    stayTime: 2000,
                    type: "warn"
                });
                return false;
            }
            $('#tip').remove();
            return true;
        },
        //TODO 实质内容判断
        checkHasTextOrImg: function () {
            var input = $('#editPanel').html();
            if(input.indexOf('<img') < 0) {
                for(var i in input) {
                    if(/[^\u2E80-\u9FFF]$/.test(input[i])) {
                        return true;
                    }
                }    
            }
            return true;
        },
        //查询文章内容
        getArticleContent: function () {
            var url = "" + '/api/social/live/article/detail';
            var param = {
                id: this.aid
            };
            Vue.api.get(url, param, (res) => {
                this.oldStr = res.data.title + res.data.content;
                this.title = res.data.title;
                $('#editPanel').html(res.data.content);
            });
        },
        //更新文章
        updArticleContent: function (status) {
            var url = "" + '/api/social/live/article/update';
            var param = {
                id: this.aid,
                ut:Vue.auth.getUserToken(),
                companyId: Vue.mallSettings.getCompanyId(),
                type: 0,//代理商
                title: this.title,
                content: $('#editPanel').html(),
                status: status //提交发布1 代理商;保存0
            };
            Vue.api.postForm(url, param, (res) => {
                //更新成功 跳转至我的
                window.location.href = '/my/market.html?t=2';
            });
        },
        //新增文章
        addOrSave: function(status){
            if(this.checkForm()){
                var params = {
                    ut:Vue.auth.getUserToken(),
                    companyId: Vue.mallSettings.getCompanyId(),
                    type: 0,//代理商
                    title: this.title,
                    content: $('#editPanel').html(),
                    status: status //提交发布1 代理商;保存0
                };
                Vue.api.postForm("" + "/api/social/live/article/create", params, (result) => {
                    //发布或者保存成功 跳转至我的
                    window.location.href = '/my/market.html?t=2';
                });
            }
        },
        goBack: function() { 
            var newStr = this.title + $('#editPanel').html();
            if(this.aid && this.oldStr != newStr) {
                this.showActionSheet = true;
            }else if(!this.aid && this.title.length > 0) {
                this.showActionSheet = true;
            }else{
                window.location.href = '/my/market.html';
            }
        },
        //图片上传成功
        uploadSuccess: function(data) {
            if (data && data.filePath) {
                $('#tip').remove();
                $('#editPanel').append('<br><img alt="" src="'+ data.filePath +'"><br><br>');
            }
        }
    }
});