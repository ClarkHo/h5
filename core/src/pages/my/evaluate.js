import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import UiFileUpload from "../../components/ui-file-upload.vue";
import config from "../../../env/config.js";


const orderCode = Vue.utils.paramsFormat(window.location.href).mpId;

new Vue({
    el: 'body',
    components: {
        UiHeader,
        UiFileUpload
    },
    data: {
        ut:Vue.auth.getUserToken(),
        companyId:Vue.mallSettings.getCompanyId(),
        isHideUserName:0, // 是否匿名：0:隐藏；1:显示
        evaluateInit:'',//初始化评价页面
        commentRuleUrl:[],//评论规则
        inputJson:{},//订单的商品评价集合
        userMPCommentVOList:{},//评价集合
        orderCode:orderCode,
    },
    ready: function(){
        this.init();
        this.getCommentRule();
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
                // ut: 'c1b78a86beb3476ea2e57a3638308558',
                // orderCode: '160901647172962084'
                ut:this.ut,
                orderCode:this.orderCode
            };
            Vue.api.get("" + "/api/social/my/comment/init", params, (result) => {
                for(var i in result.data) {
                    result.data[i].mpcPicList = [];
                }
                this.evaluateInit = result.data;

                this.inputJson={
                    "userMPCommentVOList":this.evaluateInit
                };//订单的商品评价集合
            });
        },
        // 提交评价
        save:function () {
            this.inputJson={
                "isHideUserName":this.isHideUserName,
                "userMPCommentVOList":this.evaluateInit
            };//订单的商品评价集合
            var params = {
                ut: this.ut,
                inputJson : JSON.stringify(this.inputJson)
            };
            Vue.api.postForm("" + "/api/social/my/comment/save", params, (result) => {
                $.tips({
                    content: '评价成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    location.href = '/my/my-order.html';
                }, 2000);
            });
        },
        // 获取评论规则URL
        getCommentRule:function () {
            var params = {
                companyId: this.companyId,
                platform: 2,
                adCode: 'comment_rule',
                platfromId: 0,
                pageCode: 'H5_HOME'
            };
            Vue.api.get("" + "/api/dolphin/list", params, (result) => {
                this.commentRuleUrl = result.data.comment_rule[0];
            });
        }
    }
});