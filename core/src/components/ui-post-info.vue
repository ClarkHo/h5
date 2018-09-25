<template>
<div class="ui-post-info">
      <ul class="ui-list ui-list-one" >
          <li  v-link-to="'/community/my-center.html?id=' +postDetail.publishUserid ">
              <div class="ui-list-thumb w35h35">
              <span class="disIB posR">
                  <img :src=" postDetail.publishUserHeadPic || '${staticPath}/images/logo.png?v=${version}'"
                       class="w35h35 radius50"/>
              </span>
                  <img src="${staticPath}/images/mark.png" class="mark" v-if="postDetail.talentPublish==1"/>
              </div>
              <div class="ui-list-info" style="margin-top:2px;" v-if="!showDelete">
                  <h4 class="ui-nowrap f14 c3">{{postDetail.publishUsername}}</h4>
                  <div class="ui-txt-info c9">{{postDetail.publishTimeStr}}</div>
              </div>
              <template v-if="showDelete">
              <div class="post-details h35 mgT10">
                  <h4 class="ui-nowrap f14 c3 ">{{postDetail.publishUsername}}</h4>
                  <div class="ui-txt-info c9 mgT5">{{postDetail.publishTimeStr}}</div>
              </div>
              <div class="post-details text-right mgT20 posR">
                  <p class="c6" @click.stop="postDetail.delete=!postDetail.delete" v-if="!collect">
                      <i class="icon icon-pointer" style="margin-top:-5px;" ></i>
                  </p>
                  <p class="c6" @click.stop="postDetail.collection=!postDetail.collection" v-if="collect">
                      <i class="icon icon-pointer" style="margin-top:-5px;" ></i>
                  </p>
                  <span class="mgT5 showPop" @click.stop="deleteDialog(postDetail.id)" v-if="postDetail.delete"> 删除</span>
                  <span class="mgT5 showPop" @click.stop="cancelDialog(postDetail.id,postDetail.type)" v-if="postDetail.collection"> 删除</span>
                  <!--<p class="showPop">删除</p>-->
              </div>
              </template>
          </li>
      </ul>

      <ul class="ui-list ui-list-pure"  v-link-to=" '/community/post-details.html?id=' +postDetail.id  ">
          <li>
              <img :src="postDetail.url800x800" alt="" width="100%" class="disIB"/>
              <p class="f16 c0 mgT10 ui-nowrap-multi">
              <span class="cf bgffb400 f10 pdL5 pdR5 mgR5 border-radius2 disIB pdT2" v-if="postDetail.sticky==1">置顶</span>
                  <span class="cf bgffb400 f10 pdL5 pdR5 mgR5 disIB border-radius2 pdT2" v-for="tag in postDetail.tagList">{{tag.tagName}}</span>
                  <span class="vkaM">{{postDetail.title}}</span>
              </p>
              <!--<p class="f14 c3 ui-nowrap">{{postDetail.title}}</p>-->

              <p class="cb2b2b2 f12">{{postDetail.contentText}}</p>
              <div class=" pdT10 c6 f13 bgf overflowhidden pdB12">
              <!--<p class="fl" v-if="showDelete==0">-->
                  <!--<span><i class="icons4 icons4-my-3 pdR5 mgT-5"></i>{{postDetail.rewards||0}}打赏</span></p>-->
              <p class="fr">
                <span><i class="icons4 icons4-comments mgR5"></i>{{postDetail.comments||0}}</span>
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
      <!--商品-->
      <div v-if="postDetail.postProductList && postDetail.postProductList.length>0">
          <ul class="ui-list ui-list-one ui-list-link ul-top-line"
              v-for="prod in postDetail.postProductList">
              <div class="ui-border-t mgL10"></div>
              <li @click="gotoDetail(prod.mpId)">
                  <img :src="prod.picUrl" class="ui-list-thumb w35h35 disIB"/>
                  <div class="recommend-pro">
                      <p class="f15 c0 ui-nowrap">{{prod.title}}</p>
                      <p class="cffb400 f15 mgT8 pdB10">¥{{prod.originalPrice}}</p>
                  </div>
              </li>
          </ul>
      </div>
      <!--商家-->
      <ul class="ui-list ui-list-one" v-if="postDetail.postMerchant">
          <div  class="ui-border-t mgL10"></div>
          <li>
              <div class="ui-list-thumb w55h55">
              <span :style="{'background-image':'url('+postDetail.postMerchant.merchantLogoUrl+')','background-position':'center'}"
                    class="disIB"></span>
              </div>
              <!--<img :src="merchant.merchantLogoUrl" class="ui-list-thumb w55h55 disIB"/>-->
              <div class="recommend-pro pdB5">
                  <p class="f14 c3">{{postDetail.postMerchant.merchantName}}</p><!--第一名cff7356-->
                  <p class="c6 f12 pdR15 mgT5 ui-nowrap">
                      <i class="icons4 icons4-shopLocation"></i>{{postDetail.postMerchant.provinceName}}{{postDetail.postMerchant.cityName}}{{postDetail.postMerchant.countyName}}
                  </p>
                  <p class="c6 f12 mgT5">
                    <i class="icons4 icons4-shopName"></i>
                    <span class="disIB mgR5" v-for="tag in postDetail.tagList">{{tag.tagName}}</span>
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
        //重定向
        gotoDetail:function(mpId){
            "use strict";
            if(Vue.browser.isApp()){
                document.location = '${appSchema}://productdetail?body={"mpId":'+mpId+'}'

            }else{
                document.location.href='/detail.html?itemId='+mpId
            }
        },
    }
}
</script>



