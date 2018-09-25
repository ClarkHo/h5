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
        evaluateInit:'',//初始化追加评价页面
        commentRuleUrl:[],//评论规则
        inputJson:{},//订单的商品评价集合
        userAddMPCommentVOList:[],
        orderCode:orderCode,
        addShinePicList:[],
        flag:true
    },
    ready: function(){
        this.init();
        //this.getCommentRule();
    },
    methods: {

        //图片上传成功
        uploadSuccess: function(data, index) {
            if (data && data.filePath) {
                this.addShinePicList.push(data.filePath);
                // this.userAddMPCommentVOList[index].addShinePicList.push(data.filePath);
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
                    this.addShinePicList.splice(j, 1);
                }
            });
        },



        // 初始化个人商品评价页面
        init:function () {
            var params = {
                ut:this.ut,
                orderCode:this.orderCode
            };
            this.userAddMPCommentVOList.addShinePicList=new Array();
            Vue.api.get(config.apiHost + "/api/social/my/comment/addInit", params, (result) => {
                // this.evaluateInit = result.data;
                for (let p of  result.data || []) {
                   p.addContent=''
                }
                this.evaluateInit = result.data;
            });
        },
        // 提交评价
        save:function () {
            this.userAddMPCommentVOList.forEach((item) => {
                if(item.addContent == ''){
                    $.tips({
                        content: '追评内容不能为空',
                        stayTime: 2000,
                        type: "warn"
                    });
                    this.flag = false;
                    return;
                }
                this.flag = true;
            });
            if(!this.flag){
                return;
            }
            this.inputJson={
                "userAddMPCommentVOList":this.userAddMPCommentVOList
            };
            var params = {
                ut: this.ut,
                inputJson : JSON.stringify(this.inputJson)
                // inputJson : this.inputJson
            };
            Vue.api.postForm(config.apiHost + "/api/social/my/comment/addSave", params, (result) => {
                $.tips({
                    content: '追加评论成功',
                    stayTime: 2000,
                    type: "warn"
                });
                setTimeout(() => {
                    history.back();
                }, 2000);
            });
        },
        // 获取评论规则URL
     /*   getCommentRule:function () {
            var adCode = 'comment_rule';
            Vue.gateway.getHomeDolphin(adCode,(result)=> {
                this.commentRuleUrl = result.data.comment_rule[0];
            });
        }*/
    },
    computed:{
        userAddMPCommentVOList: function () {
            var i=[] ;
            for (let p of this.evaluateInit || []) {
                i.push({
                    mpCommentId:p.id,
                    orderItemId:p.soItemId,
                    addContent:p.addContent,
                    addShinePicList:this.addShinePicList
                })
            }
            return i;
        }
    }
});