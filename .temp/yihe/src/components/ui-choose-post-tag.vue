<template>
    <div class="xui-choose-post-tag" :class="{show: show}">
        <header class="ui-header ui-header-stable ui-border-b">
            <i class="ui-icon-return" @click="close()"></i>
            <!-- <a href="{{backUrl}}" v-if="backUrl"><i class="ui-icon-return"></i></a> -->
            <h1 v-cloak>选择标签</h1>
            <a href="#" class="handle cf" v-if="!isCenter">（{{checkedTagList.length}}/3）</a>
            <a href="#" class="handle cf" v-if="isCenter" >（{{checkedTagList.length}}）</a>
        </header>
        <!--提示-->
        <section class="ui-container mgB30" style="overflow: auto;height:100%">
            <div class="ui-form">
                <template v-if="!isCenter">
                <div class="ui-form-item ui-form-item-checkbox ui-border-b lineH45px height45px" v-for="tag in allTagList" @click="tagTips">
                    <p class="c3 f14">{{tag.tagName}}</p>
                    <label class="ui-checkbox-s label-position" style="text-align: right;" >
                        <input type="checkbox" value="{{tag.tagId}}" :disabled ="tag.disabled" v-model="tag.isBind" @change="selectTag(tag)" >
                    </label>
                </div>
                    </template>
                <template v-if="isCenter">
                <div class="ui-form-item ui-form-item-checkbox ui-border-b lineH45px height45px" v-for="tag in allTagList">
                    <p class="c3 f14">{{tag.tagName}}</p>
                    <label class="ui-checkbox-s label-position" style="text-align: right;" >
                        <input type="checkbox" value="{{tag.tagId}}"  v-model="tag.isBind" >
                    </label>
                </div>
                    </template>
            </div>
        </section>
        <!-- <div class="tip mg0Auto cf text-center" v-if="checkedTagList.length>3">
            <p class="disIB pd15 bg5c5c5c radiusAll4">最多只能选择三个</p>
        </div> -->
        <footer class="ui-footer ui-footer-stable">
            <button class="btn-wq-lg bgffb400 cf" @click="confirm()">确定</button>
        </footer>
    </div>
</template>
<style lang="css">
    .bottom-liner{
        margin-left: 10px;
        margin-right: 10px;
    }
   .ui-form{
       padding-bottom:30px;
   }
</style>
<script>
    import Vue from "vue";

    export default {
        props: ["type", "callback", "show","disabled","isCenter"],
        data: function () {
            return{
                allTagList:[],
            }
        },
        computed: {
            //选中的tags
            checkedTagList: function () {
                var arr = [];
                for (var i = 0; i < this.allTagList.length; i++) {
                    var tag = this.allTagList[i];
                    if (tag.isBind == 1) {
                        tag.isBind = 1;
                        arr.push(tag);
                    }
                }
                return arr;
            },
            unCheckedTagList:function(){
                var  unArr = [];
                for (var i = 0; i < this.allTagList.length; i++) {
                    var tag = this.allTagList[i];
                    if (tag.isBind == 0) {
                        tag.isBind = 0;
                        unArr.push(tag);
                    }
                }
                return unArr;
            }
        },
        ready:function () {
            this.getTagList();
           // this.selectTag();
        },
        methods: {
            //获取标签列表
            getTagList:function () {
                var params={
                    ut:Vue.auth.getUserToken(),
                    tagType:this.type,    //标签类型，1：帖子标签
                };

                Vue.api.postForm("/api/social/read/tag/tagList",params,(result)=>{
                    if (result.data && result.data.allTagList) {
                        this.allTagList=result.data.allTagList;
                        for(var i in this.allTagList){
                            Vue.set(this.allTagList[i], 'disabled', false);
                            if(!this.isCenter) Vue.set(this.allTagList[i], 'isBind', 0);
                        }
                    }
                });
            },

            //选择tag,如果超过3个标签则提示
            selectTag: function (tag) {
                if (this.checkedTagList.length >= 3) {
                    for(var i in this.unCheckedTagList){
                        Vue.set(this.unCheckedTagList[i], 'disabled', true);
                    }

                }
                else{
                    for(var i in this.unCheckedTagList){
                        Vue.set(this.unCheckedTagList[i], 'disabled', false);
                    }
                }
            },
            tagTips:function () {
                if(this.checkedTagList.length == 3){
                    Vue.utils.showTips("最多只能选择三个标签哦");
                }
            },
           
            //关闭弹层
            close:function () {
                this.show = false;
                document.body.scrollTop=0;
            },

            //确定选择
            confirm:function () {
                if (this.checkedTagList.length == 0) {
                    Vue.utils.showTips("请选择至少一个标签");
                    return;
                }

                if (this.checkedTagList.length >3&&!this.isCenter) {
                    Vue.utils.showTips("最多只能选择3个标签");

                    return;
                }

                if (typeof this.callback == 'function') {
                    this.callback(this.checkedTagList);
                }

                this.close();
            }
        }
    }
</script>

<style lang="less">
    .xui-choose-post-tag {
        background-color: #fff;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 101;
        overflow: auto;
        display: none;

        &.show {
            display: block;
        }
    }
</style>
