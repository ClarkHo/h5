<template>
    <div class="ui-image-viewer" :class="{'show': show}" @click="hideImageViewer">
        <h4 class="step"><em>{{currentIndex+1}}</em>/{{images.length}}</h4>
        <div class="image-wrap">
            <ul>
                <li v-for="image in images" class="view-item" track-by="$index" :class="{active: $index == currentIndex}" v-touch:swipeleft="onSwipeLeft" v-touch:swiperight="onSwipeRight">
                    <img :src="image">
                </li>
            </ul>
        </div>
    </div>
</template>
<style lang="less">
    .ui-image-viewer{
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 1000;
        display: none;

      &.show {
        display: block;
        .image-wrap{
            top: 20%;
        }
       }

      em {
        color: #fff;
        font-weight: bold;
      }


      .view-item {
        display: none;

        &.active {
            display: block;
        }
      }

      .step {
        text-align: center;
        padding: 10px 0;
        color: #fff;
      }

      img {
        width: 100%;
        transition: transform 1.2s ease-in-out;
        -webkit-transition: transform 1.2s ease-in-out;
        &.enlarge{
            transform:scale(1.2);
        }
      }

      .image-wrap{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        transition: top 1.2s ease-in-out;
        -webkit-transition: top 1.2s ease-in-out;
      }
    }

</style>
<script>
export default {
    props: ["show", "images","needindex","currentIndex"],
    data: function () {
        return {
            currentIndex: this.needindex?this.currentIndex:0
        }
    },
    watch:{
          //如果照片内容改变，重置索引位置
          images:function(){
             if(!this.needindex) this.currentIndex = 0;
          }
      },
    methods: {
        //隐藏菜单
        hideImageViewer: function () {
            this.$emit("close");
            this.show = false;
        },

        //左滑动
        onSwipeLeft: function () {
            if (!this.images || this.images.length < 2) {
                return;
            }

            if (this.currentIndex < (this.images.length-1)) {
                this.currentIndex += 1;
            } else {
                this.currentIndex = 0;
            }
        },

        //右滑动
        onSwipeRight: function () {
            if (!this.images || this.images.length < 2) {
                return;
            }

            if (this.currentIndex > 0) {
                this.currentIndex -= 1;
            } else {
                this.currentIndex = this.images.length-1;
            }
        }
    }
}
</script>
