<template>
    <div :id="id" class="ui-border-b ui-richtext-editor" contenteditable="true">
        <span class="editor-placeholder c9">{{placeholder || '写点有什么吧'}}</span>
    </div>
</template>
<script>
var timer = null;

export default {
    props: ["id", "placeholder", "content"],
    data: function () {
        return {
            hasPlaceholder: true
        };
    },
    computed: {
        editorId: function () {
            return "#" + this.id;
        }
    },
    ready: function (){
        $(this.editorId).focus(()=>{
            //获取焦点检测内容变化
            if (!timer) {
                timer = setInterval(()=>{
                    this.detectChange();
                }, 500);
            }
            this.removePlaceholder();
        }).blur(()=>{
            //焦点失去就不在检测内容变化
            if (timer) {
                clearInterval(timer)
                timer = null;
            }
        });
    },
    methods: {
        //移除placeholder
        removePlaceholder: function () {
            if (this.hasPlaceholder) {
                $(this.editorId + " .editor-placeholder").remove();
                this.hasPlaceholder = false;
            }
        },

        //获取富文本内容
        getContent: function () {
            return $(this.editorId).html();
        },

        //更改内容
        detectChange: function () {
            var newValue = this.getContent();
            if (newValue != this.content) {
                this.content = newValue;
            }
        },

        //往富文本框添加元素
        append: function (element) {
            this.removePlaceholder();
            if (element) {
                $(this.editorId).append(element);
                this.content = this.getContent();
            }
        }
    }
}
</script>

<style lang="less">
    .ui-richtext-editor {
        min-height: 180px;
        padding: 10px;
        -webkit-user-select:text;

        img {
          display: block;
          max-width: 100%;
        }
    }
</style>