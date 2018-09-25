
/**
 * Vue-btn-copy
 * 使用前先引用clipboard.min.js
 * 若有需要，可复写btn-copy类，改变按钮的样式
 * 
 * @param type 复制类型 ['text','target']  text表示copy的是一段字符，target表示copy的是一个input或者textarea的value
 * @param value 需要copy的字符段，或者input、textarea的id
 * @param text 复制按钮展示的文字  [可选]
 * @param left、top 按钮的位置    [可选]
 * @param class 可以传一个class进来，覆盖组件的样式 [可选]
 * @param index 复制按钮的id[必传]，一个页面多个复制按钮的唯一标识
 * 例子:
 * <ui-btn-copy :type="'text'" :value="order.orderCode" :top="1" :left="5" :text="'复制按钮'"></ui-btn-copy>
 * <ui-btn-copy :type="'target'" :value="'#input'" :top="1" :left="5" :text="'复制按钮'"></ui-btn-copy>
*/




<template>
    <button :id="index" v-if="type=='text'&&show" class="ui-btn border-btn copy" :class="class" :style="{top:top +'px',left:left +'px'}" :data-clipboard-text="value">{{text||'复制'}}</button>
    <button :id="index" v-if="type=='target'&&show" class="ui-btn border-btn copy" :class="class" :style="{top:top +'px',left:left +'px'}" :data-clipboard-target="value">{{text||'复制'}}</button>
</template>
<style lang="less">
    .copy{
        padding: 0 6px;
        font-size: 12px;
        height: 20px;
        line-height: 19px;
        min-width: 45px;
        position: relative;
    }

</style>
<script>
import Vue from "vue";
export default {                                          
    props: ["type", "value", "text", "left", "top", "class", "index"],
    data:function(){
        return {
            show:true
        }
    },
    ready: function () {
        var copy = new Clipboard('#' + this.index);
        this.show = Clipboard.isSupported();
        copy.on('success', function(e) {
            $.tips({
                content:"复制成功",
                type:'success',
                stayTime:2000
            })
        });
    },
    methods: {
    }
}
</script>
