<template>
<div class="xui-select-emotion ui-actionsheet" :class="{show: show}" @click="show=false">
  <div class="ui-actionsheet-cnt">
        <div id="emotions">
           <span class="emoticon emoticon-smile" title="Smile" contenteditable="false"></span>
           <span class="emoticon emoticon-sad-smile" title="Sad Smile" contenteditable="false"></span>
           <span class="emoticon emoticon-big-smile" title="Big Smile" contenteditable="false"></span>
           <span class="emoticon emoticon-cool" title="Cool" contenteditable="false"></span>
           <span class="emoticon emoticon-wink" title="Wink" contenteditable="false"></span>
           <span class="emoticon emoticon-crying" title="Crying" contenteditable="false"></span>
           <span class="emoticon emoticon-sweating" title="Sweating" contenteditable="false"></span>
           <span class="emoticon emoticon-speechless" title="Speechless" contenteditable="false"></span>
           <span class="emoticon emoticon-kiss" title="Kiss" contenteditable="false"></span>
           <span class="emoticon emoticon-tongue-out" title="Tongue Out" contenteditable="false"></span>
           <span class="emoticon emoticon-blush" title="Blush" contenteditable="false"></span>
           <span class="emoticon emoticon-wondering" title="Wondering" contenteditable="false"></span>
           <span class="emoticon emoticon-sleepy" title="Sleepy" contenteditable="false"></span>
           <span class="emoticon emoticon-dull" title="Dull" contenteditable="false"></span>
           <span class="emoticon emoticon-in-love" title="In love" contenteditable="false"></span>
           <span class="emoticon emoticon-evil-grin" title="Evil grin" contenteditable="false"></span>
           <span class="emoticon emoticon-talking" title="Talking" contenteditable="false"></span>
           <span class="emoticon emoticon-yawn" title="Yawn" contenteditable="false"></span>
           <span class="emoticon emoticon-puke" title="Puke" contenteditable="false"></span>
           <span class="emoticon emoticon-it-wasnt-me" title="It wasn't me" contenteditable="false"></span>
           <span class="emoticon emoticon-party" title="Party!!!" contenteditable="false"></span>
           <span class="emoticon emoticon-worried" title="Worried" contenteditable="false"></span>
           <span class="emoticon emoticon-nerd" title="Nerd" contenteditable="false"></span>
           <span class="emoticon emoticon-lips-sealed" title="Lips Sealed" contenteditable="false"></span>
           <span class="emoticon emoticon-hi" title="Hi" contenteditable="false"></span>
           <span class="emoticon emoticon-call" title="Call" contenteditable="false"></span>
           <span class="emoticon emoticon-devil" title="Devil" contenteditable="false"></span>
           <span class="emoticon emoticon-angel" title="Angel" contenteditable="false"></span>
           <span class="emoticon emoticon-envy" title="Envy" contenteditable="false"></span>
           <span class="emoticon emoticon-wait" title="Wait" contenteditable="false"></span>
           <span class="emoticon emoticon-bear" title="Bear" contenteditable="false"></span>
           <span class="emoticon emoticon-make-up" title="Make-up" contenteditable="false"></span>
           <span class="emoticon emoticon-thinking" title="Thinking" contenteditable="false"></span>
           <span class="emoticon emoticon-rofl" title="Rolling on the floor laughing" contenteditable="false"></span>
           <span class="emoticon emoticon-whew" title="Whew" contenteditable="false"></span>
           <span class="emoticon emoticon-punch" title="Punch" contenteditable="false"></span>
           <span class="emoticon emoticon-bandit" title="Bandit" contenteditable="false"></span>
           <span class="emoticon emoticon-malthe" title="Malthe" contenteditable="false"></span>
           <span class="emoticon emoticon-tauri" title="Tauri" contenteditable="false"></span>
           <span class="emoticon emoticon-yes" title="Yes" contenteditable="false"></span>
           <span class="emoticon emoticon-no" title="No" contenteditable="false"></span>
           <span class="emoticon emoticon-handshake" title="Shaking Hands" contenteditable="false"></span>
           <span class="emoticon emoticon-heart" title="Heart" contenteditable="false"></span>
           <span class="emoticon emoticon-broken-heart" title="Broken heart" contenteditable="false"></span>
           <span class="emoticon emoticon-mail" title="Mail" contenteditable="false"></span>
           <span class="emoticon emoticon-flower" title="Flower" contenteditable="false"></span>
           <span class="emoticon emoticon-rain" title="Rain" contenteditable="false"></span>
           <span class="emoticon emoticon-sun" title="Sun" contenteditable="false"></span>
           <span class="emoticon emoticon-time" title="Time" contenteditable="false"></span>
           <span class="emoticon emoticon-music" title="Music" contenteditable="false"></span>
           <span class="emoticon emoticon-movie" title="Movie" contenteditable="false"></span>
           <span class="emoticon emoticon-phone" title="Phone" contenteditable="false"></span>
           <span class="emoticon emoticon-coffee" title="Coffee" contenteditable="false"></span>
           <span class="emoticon emoticon-pizza" title="Pizza" contenteditable="false"></span>
           <span class="emoticon emoticon-cash" title="Cash" contenteditable="false"></span>
           <span class="emoticon emoticon-muscle" title="Muscle" contenteditable="false"></span>
           <span class="emoticon emoticon-cake" title="Cake" contenteditable="false"></span>
           <span class="emoticon emoticon-beer" title="Beer" contenteditable="false"></span>
           <span class="emoticon emoticon-drink" title="Drink" contenteditable="false"></span>
           <span class="emoticon emoticon-star" title="Star" contenteditable="false"></span>
        </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";

export default {
    props: ["show", "callback"],
    data: function () {
      return {
      };
    },
    ready:function(){
      $("#emotions span").click((e)=>{
          if (typeof this.callback == 'function') {
            this.callback(e.target);
            this.close();
          }
          //console.log(e.target)
      });
    },
    methods: {
      close: function () {
          this.show = false;
      }
    }
}
</script>

<style lang="less">
  .xui-select-emotion {
    #emotions {
        padding: 10px;
    }
  }
</style>

