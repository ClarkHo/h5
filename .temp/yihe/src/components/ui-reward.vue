<template>
<div class="xui-reward ui-actionsheet" :class="{show: show}" @click.stop="clickHandler($event)">
  <div class="ui-actionsheet-cnt">
      <h4 class="text-left ui-border-b bgf">伊豆余额：<span class="c3">{{ybean}}个</span></h4>
      <ul class="ui-row bgf pdL10 pdR10">
          <li v-for="item in rewardConfig" class="ui-col ui-col-33 pd10" @click="selectReward(item)">
              <button class="btn-yidou" :class="{selected: !custom && amount ==item}">{{item}}个伊豆</button>
          </li>
      </ul>
      <div class="custom-amount text-left pdL10">
          <label class="label">自定义</label>
          <ui-number-input class="mgL10" v-model="amount" type="integer" @input="changeHandler"></ui-number-input>
      </div>
      <div class="mgT10">
          <button class="btn-reward" @click="confirmReward">打赏</button>
      </div>
  </div>
</div>

</template>

<script>
import Vue from "vue";
import UiNumberInput from "./ui-number-input.vue";
import config from "../../env/config.js";

export default {
    props: ["show", "refId", "refType", "callback"],
    components: {UiNumberInput},
    data: function () {
      return {
          //打赏的金额
          amount: '',
          //是否是自定义打赏金额
          custom: false,
          //伊豆的数量
          ybean: 0,
          ut: Vue.auth.getUserToken(),
          platformId: config.platformId,
          rewardConfig:[]
      };
    },
    watch: {
        "show": function (boo) {
            if(boo) {
                this.getYbean();
                this.getRewardConfig();
            }
        }
    },
    ready: function() {

    },
    methods: {
      selectReward: function (amount) {
        this.amount = amount;
        this.custom = false;
      },

      changeHandler: function (amount) {
        this.custom = true;
      },

      //确认打赏
      confirmReward: function () {
          if (!this.amount) {
              Vue.utils.showTips("请输入要打赏的伊豆数量");
              return;
          }
          if (this.amount<=0) {
              Vue.utils.showTips("请输入大于0的伊豆数量");
              return;
          }

           var dialog = $.dialog({
                title: "",
                content: "确定打赏<span style='color:#ffb400;'>" + this.amount + "个</span>伊豆？",
                button: ["取消", "确认"]
            });

            dialog.on("dialog:action", (e) => {
                //点击确定按钮
                if (e.index == 1) { 
                     if (this.amount > this.ybean) {
                      Vue.utils.showTips("伊豆余额不足");
                      return;
                    }
                    
                    this.doReward(this.amount);
                }
        });
      },

      //获得伊豆数量
      getYbean: function () {
         var params = {
                ut: this.ut,
                platformId: this.platformId,
                isBean:1
            };
           
            Vue.api.get("/api/my/wallet/summary", params, (res) => {
                if (res.data) {
                  this.ybean = res.data.yBean || 0;
                }
            });
      },
      //候选伊豆数
      getRewardConfig: function() {
         var params = {
            ut: this.ut
         };
         Vue.api.get("/api/social/read/reward/getRewardConfig", params, (res) => {
             if (res.data) {
               this.rewardConfig = res.data.optionList || [];
             }
         });
      },

      doReward: function (rewardPoint) {
        var params = {
          ut: this.ut,
          refId: this.refId,
          refType: this.refType,
          rewardPoint: rewardPoint
        };

        Vue.api.postForm("/api/social/write/reward/doReward", params, (result)=>{
            Vue.utils.showTips("成功打赏" + rewardPoint + "个伊豆");
            //成功打赏回调
            if (this.callback) {
              this.callback();
            }
        });

        this.close();
      },

      close: function () {
          this.show = false;
      },

      clickHandler: function (event) {
        var className= event.target.className || "";
        //如果在内容区域外点击，则关闭弹层
        if (className.indexOf("xui-reward")>=0) {
          this.close();
        }
      }

    }
}
</script>
<style lang="less">
  @color: #ffb400;

  .ui-actionsheet .ui-actionsheet-cnt {
    min-height: inherit;
      z-index:1000;
  }

  .xui-reward {
      font-size: 14px;

      .custom-amount {
        margin: 15px 10px;

        label {
          font-size: 14px;
        }

        input {
          padding: 10px;
          color: @color;
          border: solid 1px #ddd;
          border-radius: 3px;
          font-size: 14px;
          width: 70%;
        }
      }

      .btn-yidou {
        border: solid 1px @color;
        color: @color;
        font-size: 14px;

        &.selected {
            background-color: @color;
            color: #fff;
        }
      }

      .btn-reward {
        background-color: @color;
        color: #fff;
      }
  }

</style>

