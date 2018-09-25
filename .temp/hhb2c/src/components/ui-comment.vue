<template>
<div class="xui-comment">
    <footer class="ui-footer ui-footer-stable" v-if="!showPopup">
         <div class="bgf comment ui-border-t">
            <div class="input">
                <i class="icons4 icons4-edit"></i>
                <input type="text" class="ui-border-b" readonly="true" placeholder="我也想评论一下" @click="showPopup=true">
            </div>
            <div class="comment-icons ">
                <label>
                    <i class="icons4 icons4-mesg" @click="showPopup=true"></i>
                    <p class="f10 c3 mgT5">{{comments}}</p>
                </label>
                 <label>
                    <i class="icons4 icons4-unlike2" v-if="!isLike" @click="doLike"></i>
                    <i class="icons4 icons4-like2" v-if="isLike"  @click="unlike"></i>
                    <p class="f10 c3 mgT5">{{likes}}</p>
                </label>
                <label>
                    <!--未收藏-->
                    <i class="icons4 icons4-collect" v-if="!isFavorite" @click="doFavorite"></i>
                    <!--已收藏-->
                    <i class="icons4 icons4-collect1" v-if="isFavorite" @click="undoFavorite"></i>
                    <!--<i class="icons4 icons4-collect1"></i>-->
                    <p class="f10 c3 mgT5">{{favorites}}</p>
                </label>
            </div>
       </div>
    </footer>

    <!-- 写评论弹层-->
    <div @click="showPopup=false" class="comment-con" v-if="showPopup"> </div>
    <div class="comment-popup" v-if="showPopup">
        <div class="ui-card">
            <textarea placeholder="请输入您的评价(1-200字)" maxlength="200" class="remark"  v-model="comment"></textarea>
            <p class="text-right"><span class="red">{{comment.length}}</span>/200</p>
            <div class="imgarr">
                <div class="imgbox" v-for="img in picList" track-by="$index" @click="delImg($index)">
                    <i class="ui-icon-close-progress"></i>
                    <img alt="" width="50" height="50" :src="img">
                </div>
                <div class="imgbox" v-if="picList.length < 5">
                    <ui-file-upload :callback="uploadSuccess" multiple="true" :max-count.sync="maxCount"></ui-file-upload>
                    <img alt="" width="50" height="50" src="${staticPath}/images/camera.png?v=${version}">
                </div>
            </div>
      <!--       <div class="imgarr">
                <div class="imgbox" @click="delImg($index)">
                    <i class="ui-icon-close-progress"></i>
                    <img alt="" width="50" height="50" :src="img">
                </div>
                <div class="imgbox" @click="delImg($index)">
                    <i class="ui-icon-close-progress"></i>
                    <img alt="" width="50" height="50" src="${staticPath}/images/exceptional.png?v=${version}">
                </div>
                <div class="imgbox">
                    <ui-file-upload :callback="uploadSuccess"></ui-file-upload>
                    <img alt="" width="50" height="50" src="${staticPath}/images/camera.png?v=${version}">
                </div>
            </div> -->
            <p class="f12 cb2b2b2">上传图片晒图，最多上传5张</p>
        </div>
        <div class="comment-send">
            <button class="btn-send" @click="addComment">发送</button>
        </div>
    </div> <!--//end xui-comment-popup-->

</div>
</template>

<script>
import Vue from "vue";
import UiFileUpload from "./ui-file-upload.vue";

//user token
let ut = Vue.auth.getUserToken();

    export default {
        components: { UiFileUpload },
        props: {
            //评论量
            comments: {
              type: Number,
              default: 0
            },
             //赞
            likes: {
              type: Number,
              default: 0
            },
            //收藏量
            favorites: {
              type: Number,
              default: 0
            },
            //评论对象的id
            refId: Number,
            //帖子类型 ：1 话题 2 活动 3 本地
            refType: Number,
            //是否已收藏
            isFavorite: Boolean,
            //是否已点赞
            isLike: Boolean,
            //评论成功后的回调
            onComment: Function,
            showComment:Boolean
        },
        data: function () {
          return {
            //是否显示写评论弹层
            showPopup: false,
            //评论的内容
            comment: '',
            //评论的图片
            picList: [],

            isBuzy:false
          };
        },
        computed: {
          //还可以上传的最大图片数量
          maxCount: function () {
              return Math.max(5-this.picList.length, 0);
          }
        },
        ready:function(){
          //
        },
        methods: {
          //添加评论
          addComment: function () {
              if (this.comment.trim().length == 0&&this.picList.length == 0) {
                Vue.utils.showTips("请输入评论内容或添加评论图片");
                return;
              }

//              if(this.comment.trim().length<5){
//                  Vue.utils.showTips("您输入的内容少于5个字");
//                  return;
//              }

              var params = {
                ut: ut,
                refId: this.refId,
                commentType: this.refType
                  //comment: this.comment
              };

              if (this.picList.length > 0) {
                params.picList = this.picList.join(",");
              }
              if(this.comment.length>0){
                  params.comment = this.comment;
              }

              Vue.api.postForm("/api/social/write/comment/createComment", params, (result)=>{
                  Vue.utils.showTips("成功发表评论");
                  this.closePopup();
                  //reset
                  this.comment = '';
                  this.picList = [];
                  this.comments += 1;

                  if (typeof this.onComment == 'function') {
                    this.onComment();
                  }
              });

          },

          //图片上传成功
          uploadSuccess: function(data) {
              if (data && data.filePaths) {
                  this.picList = this.picList.concat(data.filePaths);
              }
          },

          //删除图片
          delImg: function(index) {
              var dialog = $.dialog({
                  title: "",
                  content: "确定删除该图片吗？",
                  button: ["取消", "确认"]
              });
              dialog.on("dialog:action", (e) => {
                  //点击确定按钮
                  if (e.index == 1) {
                      this.picList.splice(index, 1);
                  }
              });
          },

          //收藏帖子
          doFavorite: function () {
            if(this.isBuzy) return;
            this.isBuzy=true;
            var params = {ut: ut, refId: this.refId, refType: this.refType};
            Vue.api.postForm("/api/social/write/collection/doCollection", params, (result)=>{
                this.isBuzy = false;
                if(result.data){
                    this.isFavorite = true;
                    this.favorites += 1;
                    Vue.utils.showTips("成功收藏帖子");
                }
            });

          },

          //取消收藏帖子
          undoFavorite: function () {
            if(this.isBuzy) return;
            this.isBuzy=true;
            var params = {ut: ut, refId: this.refId, refType: this.refType};
            Vue.api.postForm("/api/social/write/collection/unCollection", params, (result)=>{
                this.isBuzy = false;
                if(result.data){
                  this.isFavorite = false;
                  this.favorites -= 1;
                  Vue.utils.showTips("取消收藏帖子");
              }
            });

          },

          // 点赞
        doLike:function () {
            if(this.isBuzy) return;
            this.isBuzy=true;
            var params = {ut: ut, refId: this.refId, likeType: 1};
            Vue.api.postForm("/api/social/write/like/doLike",params,(res)=>{
                this.isBuzy=false;
                if(res.data){
                    this.isLike = true;
                    this.likes +=1;
                    Vue.utils.showTips("成功点赞");
                }
            });
          },

          // 取消点赞
          unlike:function () {
              if(this.isBuzy) return;
              this.isBuzy=true;
              var params = {ut: ut, refId: this.refId, likeType: 1};
              Vue.api.postForm("/api/social/write/like/unlike",params,(res)=>{
                  this.isBuzy=false;
                  if(res.data){ 
                    this.isLike = false;
                    this.likes -= 1;;
                    Vue.utils.showTips("取消点赞");
                  }
              });
          },

          closePopup: function () {
              this.showPopup = false;
              this.showComment = false;
          }
        }
    }
</script>

<style lang="less">
    @import url(../common/variables.less);

    .xui-comment {
       position:relative;
         .comment-con{
             position:fixed;
             top:0;
             bottom:0;
             left:0;
             right:0;
             width:100%;
             z-index:1;
           //  background:red;
         }
          .ui-footer {
            height: 70px;
          }

          .comment-popup {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #eee;
            z-index: 10;

            .ui-card {
              padding: 10px;
              margin-right: 60px;
            }
          }

          .comment{
            height:35px;
            padding-bottom:20px;
            padding-top:15px;
            .input{
              padding:10px 12px 8px 12px;
              border-radius: 5px 5px 5px 5px ;
              background:#f4f4f4;
              display:inline-block;
              position:absolute;
              right:130px;
              left:15px;
              input{
                width:85%;
                background:#f4f4f4;
                border-right:none;
                border-top:none;
                border-left:none;
              }
            }
            .comment-icons{
              display:inline-block;
              position: absolute;
              right:5px;
              width:120px;
              text-align:center;
              label{
                text-align:center;
                display: inline-block;
                width: 25px;
                height: 50px;
                padding: 0 5px;
                line-height: 0;
                position: relative;
                i{
                  margin: 4px auto 3px;
                }
              }
            }
          }

          .comment-send {
            position: absolute;
            right: 10px;
            top: 15px;

            .btn-send {
                background-color: @themeColor;
                font-size: 12px;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                color: #fff;
                padding: 5px;
            }
          }
    }
</style>
