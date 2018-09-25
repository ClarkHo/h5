import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";

const mpId = Vue.utils.paramsFormat(window.location.href).mpId;
const soItemId = Vue.utils.paramsFormat(window.location.href).soItemId;

var vm = new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiFileUpload
    },
    data: {
        ut:Vue.auth.getUserToken(),
        companyId:Vue.mallSettings.getCompanyId(),

        evaluateInit:'',//初始化评价页面
        inputJson:{},//订单的商品评价集合
        userMPCommentVOList:{},//评价集合
        orderCode:mpId,
        soItemId:soItemId,
        notClickAgain:false,//防止再次点击
    },
    ready: function() {
        this.init();
    },
    methods: {
        //图片上传成功
        uploadSuccess: function(data, index) {
            if (data && data.filePath) {
                this.evaluateInit[index].mpcPicList.push(data.filePath);
            }
        },
        //删除图片
        delImg: function(i, j) {
            var dialog = $.dialog({
                title: "",
                content: "确定删除该图片吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                    this.evaluateInit[i].mpcPicList.splice(j, 1);
                }
            });
        },
        // 初始化个人商品评价页面
        init:function () {
            var params = {
                ut:this.ut,
                orderCode:this.orderCode,
                soItemId:this.soItemId
            };
            Vue.api.get(config.apiHost + "/api/social/my/comment/init", params, (result) => {
                for(var i in result.data) {
                    result.data[i].mpcPicList = [];
                }
                this.evaluateInit = result.data;
                this.inputJson={
                    "userMPCommentVOList":this.evaluateInit
                };
            });
        },
        // 提交评价
        save:function () {
            if (this.notClickAgain) {
                return;
            }
            for(let item of this.evaluateInit){
                if(item.commentType == 0 && (!item.content || item.content.length < 5)){
                    Vue.utils.showTips('评价内容不能少于五个字');
                    return;
                }
            }
            this.inputJson={
                "userMPCommentVOList":this.evaluateInit
            };//订单的商品评价集合
            var params = {
                ut: this.ut,
                inputJson : JSON.stringify(this.inputJson)
            };
            this.notClickAgain = true;
            Vue.api.postForm(config.apiHost + "/api/social/my/comment/save", params, (result) => {
                $.tips({
                    content: '评价成功',
                    stayTime: 2000,
                    type: "warn"
                });
                // this.notClickAgain = false;
                setTimeout(() => {
                    location.href = '/evaluate/evaluate.html';
                }, 500);
            },(res) => {
                Vue.utils.showTips(res.message);
                this.notClickAgain = false;
            });
        },

        // 修改评价
        update:function () {
            for(let item of this.evaluateInit){
                if(item.commentType == 0 && (!item.content || item.content.length < 5)){
                    Vue.utils.showTips('评价内容不能少于五个字');
                    return;
                }
            }
            var Id = location.search.match(/id=(\d+)/)[1];

            this.evaluateInit[0].id = Id;
            this.inputJson={
                "userMPCommentVOList":this.evaluateInit
            };//订单的商品评价集合
            if(Id == null || Id == ''){
                $.tips({
                    content: '请刷新几次',
                    stayTime: 2000,
                    type: "warn"
                });

                return;
            }
            var params = {
                ut: this.ut,
                commentId: Id,
                inputJson : JSON.stringify(this.inputJson)
            };
            this.notClickAgain = true;
            Vue.api.postForm(config.apiHost + "/api/social/my/comment/update", params, (result) => {
                $.tips({
                    content: '修改成功',
                    stayTime: 2000,
                    type: "warn"
                });
                this.notClickAgain = false;
                setTimeout(() => {
                    location.href = '/evaluate/evaluate.html';
                }, 500);
            },(res) => {
                Vue.utils.showTips(res.message);
                this.notClickAgain = false;
            });
        },
    }
});
