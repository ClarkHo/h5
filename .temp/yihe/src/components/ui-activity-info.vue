<template>
<div class="ui-activity-info">
      <ul class="ui-list ui-list-one" v-link-to="'/community/my-center.html?id=' +postDetail.publishUserid ">
          <li>
              <div class="ui-list-thumb w35h35">
                  <span :style="{'background-image':'url('+postDetail.publishUserHeadPic+')'}"
                        class="disIB radius50" v-if="postDetail.publishUserHeadPic"></span>
                   <span :style="{'background-image':'url(${staticPath}/images/logo.png?v=${version})'}"
                         class="disIB radius50" v-if="!postDetail.publishUserHeadPic"></span>
                  <img src="${staticPath}/images/mark.png" class="mark" v-if="postDetail.talentPublish==1"/>
              </div>
              <template v-if="showDelete">
                  <div class="post-details h35 mgT10">
                      <h4 class="ui-nowrap f14 c3 ">{{postDetail.publishUsername}}</h4>
                      <div class="ui-txt-info c9 mgT5">{{postDetail.publishTimeStr}}</div>
                  </div>
                  <div class="post-details text-right mgT20 posR">
                      <!--<p class="c6" @click.stop="postDetail.delete=!postDetail.delete" v-if="!collect">-->
                          <!--<i class="icon icon-pointer" style="margin-top:-5px;" ></i>-->
                      <!--</p>-->
                      <p class="c6" @click.stop="postDetail.collection=!postDetail.collection" v-if="collect">
                          <i class="icon icon-pointer" style="margin-top:-5px;" ></i>
                      </p>
                      <!--<span class="mgT5 showPop" @click.stop="deleteDialog(postDetail.id)" v-if="postDetail.delete"> 删除</span>-->
                      <span class="mgT5 showPop" @click.stop="cancelDialog(postDetail.id,postDetail.type)" v-if="postDetail.collection"> 删除</span>
                      <!--<p class="showPop">删除</p>-->
                  </div>
              </template>
              <div class="ui-list-info" style="margin-top:2px;" v-if="!showDelete">
                  <h4 class="ui-nowrap f14 c3">{{postDetail.publishUsername}}</h4>
                  <div class="ui-txt-info c9">{{postDetail.publishTimeStr}}</div>
              </div>
              <!--<div class="recommend-pro">-->
              <!--<p class="f14 c3 fb">{{postDetail.publishUsername}}</p>&lt;!&ndash;第一名cff7356&ndash;&gt;-->
              <!--<p class="f14 c808080 mgT10">{{postDetail.createTime |dateTime}}</p>-->
              <!--</div>-->
          </li>
      </ul>
      <ul class="ui-list ui-list-pure" v-link-to="'/community/post-details.html?id=' +postDetail.id ">
          <li class="ui-border-b">
              <div class="posR">
                  <img :src="postDetail.url800x800" alt="" width="100%" class=" disIB"/>
                  <!--未开始-->
                  <img src="${staticPath}/images/notStarted.png?v=${version}" class="active-state"
                       v-if="postActivity.state==1"/>
                  <!--进行中-->
                  <img src="${staticPath}/images/ongoing.png?v=${version}" class="active-state"
                       v-if="postActivity.state==2"/>
                  <!--已过期-->
                  <img src="${staticPath}/images/expired.png?v=${version}" class="active-state"
                       v-if="postActivity.state==3"/>
                  <span class="disIB cf f12 start-time">报名时间: {{postActivity.applyStartTime | dateTime}} 至 {{postActivity.applyEndTime | dateTime}} </span>
              </div>
              <p class="f16 c0 mgT10 ui-nowrap-multi">
                  <span class="cf bgffb400 f10 pdL5 pdR5 mgR5 border-radius2 disIB pdT2" v-if="postDetail.sticky==1">置顶</span>
                  <span class="cf bgffb400 f10 pdL5 pdR5 mgR5 border-radius2 disIB pdT2" v-for="tag in postDetail.tagList">{{tag.tagName}}</span>
                  <span class="vkaM">{{postDetail.title}}</span>
              </p>
              <p class="c808080 f12 mgT10 ui-nowrap-multi"><i class="icons4 icons4-clock mgR5"></i>活动时间{{postActivity.startTime
                  | dateTime}}&nbsp;至&nbsp;{{postActivity.endTime | dateTime}}</p>
              <p class="c808080 f12 mgT10"><i class="icons4 icons4-shopLocation mgR5"></i>活动地址：{{postActivity.provinceName}}{{postActivity.cityName}}{{postActivity.countyName}}{{postActivity.address}}
              </p>
              <p class="c808080 f12 mgT10 pdB12 pdR15">
                  <i class="icons4 icons4-amount"></i>
                  活动人数：{{postActivity.maxApply==-1 ? '不限' : postActivity.maxApply}}（{{postActivity.currentApply}}人申请  丨  {{postActivity.auditedApply}}人通过）
              </p>
              <div class="pdL15 pdR15 pdT10 c6 f13 bgf overflowhidden pdB12">
              <!--<p class="fl" v-if="showDelete==0">-->
                  <!--<span><i class="icons4 icons4-my-3 pdR5 mgT-5"></i>{{postDetail.rewards||0}}打赏</span></p>-->
              <p class="fr mgT10"><span><i class="icons4 icons4-comments mgR5"></i>{{postDetail.comments || 0}}</span>
                  <!--<span><i class="icons4 icons4-like1"></i>{{active.likes || 0}}</span>-->
                       <span>
                          <i class="icons4 mgL5"
                             :class="{'icons4-like':postDetail.islike == 0,'icons4-like1':postDetail.islike == 1}"
                             @click.stop="changeLike"></i>
                          {{postDetail.likes}}
                      </span>
              </p>
                  </div>
          </li>
      </ul>
</div>
</template>

<script>
import Vue from "vue";

var ut = Vue.auth.getUserToken();

export default {
    props: ["postDetail","showDelete","delete","collection","collect"],
    computed: {
      //活动信息
      postActivity: function () {
        return this.postDetail.postActivityVO || {};
      }
    },
    data: function () {
        return {
            isLoad: false,
        };
    },
    methods: {
        // 赞
        changeLike: function () {
            if(this.postDetail.islike==1){
                this.unlike(this.postDetail.id);
            } else {
                this.doLike(this.postDetail.id);
            }
        },
        // 点赞
        doLike:function (refId) {
            if(this.isLoad) return;
            this.isLoad=true;
            var params={
                ut: ut,
                refId: refId, //点赞对象ID
                likeType: 1//点赞类型 1帖子(包含活动、普通帖与本地帖) 2用户 3评论
            };
            Vue.api.postForm("/api/social/write/like/doLike",params,(res)=>{
                this.isLoad=false;
                if(res.data){
                $.tips({
                    content: "点赞成功",
                    stayTime: 2000,
                    type: "warn"
                });
                this.postDetail.islike=1;
                this.postDetail.likes += 1;
            }
        });
        },
        // 取消点赞
        unlike:function (refId) {
            if(this.isLoad) return;
            this.isLoad=true;
            var params={
                ut: ut,
                refId: refId, //点赞对象ID
                likeType: 1//点赞类型 1帖子(包含活动、普通帖与本地帖) 2用户 3评论
            };
            Vue.api.postForm("/api/social/write/like/unlike",params,(res)=>{
                this.isLoad=false;
                if(res.data){
                $.tips({
                    content: "取消点赞成功",
                    stayTime: 2000,
                    type: "warn"
                });
                this.postDetail.islike=0;
                this.postDetail.likes -= 1;
            }
        });
        },
        //删除对话框
        deleteDialog: function(id) {
            event.stopPropagation();
            var dialog = $.dialog({
                title: "",
                content: "你确定要删除该帖子吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                var params = {
                    ut: ut,
                    postId: id
                };
                Vue.api.postForm( "/api/social/write/post/deletePost", params, (result) => {
                    location.reload();
            });

            }else if(e.index == 0){
                this.postDetail.delete = false;
            }
        });
        },
        //取消收藏
        cancelDialog: function(id,refType) {
            event.stopPropagation();
            var dialog = $.dialog({
                title: "",
                content: "你确定要取消收藏该帖子吗？",
                button: ["取消", "确认"]
            });
            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) {
                var params = {
                    ut: ut,
                    refId: id,
                    refType:refType
                };
                Vue.api.postForm( "/api/social/write/collection/unCollection", params, (result) => {
                    location.reload();
            });

            }else if(e.index == 0){
                this.postDetail.collection = false;
            }
        });
        },
    }
}
</script>

