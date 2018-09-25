<template>
    <div v-show="show" id="drag-pop" :style="{left:left + 'px', top: top + 'px'}" @click="doSomeThing($event)">
        <img :src="imgSrc" alt="" width="100%" >
    </div>
</template>
<style lang="less">
    #drag-pop{
        position: fixed;
        /*right: 0;*/
        /*top: 200px;*/
        width: 60px;
        height: 60px;
        z-index: 10000;
        text-align:center;
        line-height:80px;
        img{
            margin-top:8px;
            width:43px;
            height:43px;
        }
    }

</style>
<script>
import Vue from "vue";
export default {
    props: {
        show:{
            default:true
        },
        left:{
            default:0
        },
        top:{
            default:200
        },
        imgSrc:{
            default:'${staticPath}/images/groupBuy.png'
        },
        onclick:{}
    },
    data: function () {
        return {
            screenWith: 365,
            isApp:Vue.browser.isApp(),
        }
    },
    ready: function() {
        this.initDrag();
    },
    methods: {
        initDrag:function () {
            var _this = this;
            var winHeight = $(window).height(),winWidth = $(window).width(),top = 200,left = winWidth - 45;
            this.screenWith = winWidth;
            var leftEnd, leftStart, topStart, topEnd;
            var body = $("#drag-pop")[0];
            var bodyMove = $("#drag-pop");
            
             
            body.addEventListener('touchstart',function (e) {
                //e.stopPropagation();
                leftStart = e.touches[0].pageX;
                topStart = e.touches[0].pageY;
                if(_this.isApp){
                    document.body.addEventListener('touchmove', preventDefault);
                }
                
                //  alert(JSON.stringify($('html')))
                 $('html').css({
                     width:'100%',
                     height:'100%',
                     overflow:'hidden'
                 })
                body.addEventListener('touchmove', move);
                
               
            })

            body.addEventListener('touchend', function (e) {
                $('html').css({
                     width:'auto',
                     height:'auto',
                     overflow:'auto'
                 })
                body.removeEventListener('touchmove', move);
                if(_this.isApp){
                    document.body.removeEventListener('touchmove', preventDefault);
                }

                var left  = body.offsetLeft, top = body.offsetTop;

                // if(left < 0){
                //     bodyMove.css('transition', 'all 0.5s').css('transform', 'translate3d('+ (0 - left + 'px') +',0,0)');
                //     bodyMove.css('transition', 'none')
                // }
                // if(top < 0){
                //     bodyMove.css('transition', 'all 0.5s').css('transform', 'translate3d(0,'+ (0 - top + 'px') +',0)');
                //     bodyMove.css('transition', 'none')
                // }
                // if(left > (winWidth - 43)){
                //     bodyMove.css('transition', 'all 0.5s').css('transform', 'translate3d('+ ((winWidth - 43) - left  + 'px') +',0,0)');
                //     bodyMove.css('transition', 'none')
                // }
                // if(top > (winHeight - 43)){
                //     bodyMove.css('transition', 'all 0.5s').css('transform', 'translate3d(0,'+ ((winHeight - 43) - top + 'px') +',0)');
                //     bodyMove.css('transition', 'none')
                // }
                if(left < 0){
                    body.style.left = 0 ;
                }
                if(top < 0){
                    body.style.top = 0 ;
                }
                if(left > (winWidth - 43)){
                    body.style.left = (winWidth - 43) + 'px';
                }
                if(top > (winHeight - 43)){
                    body.style.top = (winHeight - 43) + 'px';
                }
                
            });
            function preventDefault(e) {
                
                    e.preventDefault();
               
            }
            function move(e) {
               
                leftEnd = e.touches[0].pageX;
                topEnd = e.touches[0].pageY;
                // bodyMove.css('transition', 'all 0.5s').css('transform', 'translate3d('+ (leftEnd - leftStart + 'px') +','+ (topEnd - topStart + 'px') +',0)');
                body.style.left = body.offsetLeft + (leftEnd - leftStart) + 'px';
                body.style.top = body.offsetTop + (topEnd - topStart) + 'px';
                leftStart = leftEnd;
                topStart = topEnd;
            }
        },
        doSomeThing:function (e) {
            if(typeof this.onclick == 'function'){
                this.onclick();
            }
        }
    }
}
</script>
