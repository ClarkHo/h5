<template>
    <div style="background-color: #fff;position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 101;overflow: auto">
        <header class="ui-header ui-header-stable ui-border-b">
            <i class="ui-icon-return" @click="closeTag()"></i>
            <!-- <a href="{{backUrl}}" v-if="backUrl"><i class="ui-icon-return"></i></a> -->
            <h1 v-cloak>推荐商品</h1>
        </header>
        <section class="  ui-container mgB35" >
            <div style="background-color: #E5E5E5" class="ui-header ui-header-stable ui-border-b marTh">
                <div style="left: 10px;background-color: #FFFFFF" class="search" >
                    <i class="icon icon-search"></i>
                    <div style="padding-left: 0px;position: relative;" class="input" >
                        <input type="search" maxlength="25" v-model="keyword" placeholder="输入您要推荐的商品">
                        <!--<i class="ui-icon-close" v-if="keyword" @click="deleteSearch()"></i>-->
                    </div>
                </div>
                <a  class="c6 handle" @click="submitSearch(keyword)">搜索</a>
            </div>
            <ul style="overflow: auto;"  class=" ui-list mgT45" v-if="productList&&productList.length>0">
                <li class="" v-for="pro in productList" >
                    <img :src="pro.picUrl" class="ui-list-thumb w35h35 disIB"/>
                    <div class="recommend-pro pdT0">
                        <p class="f14 c3 ui-nowrap mgT5" style="width:90%">{{pro.name}}</p><!--第一名cff7356-->
                        <p class="cffb400 f15">¥{{pro.originalPrice}}</p>
                    </div>
                    <label class="ui-checkbox-s label-position" style="margin-top:14px">
                        <input style="top:0px" type="checkbox" :disabled="pro.disabled" :checked="pro.checked" value="{{pro.mpId}}" v-model="checkedList" @change="checkProd(pro)"/>
                    </label>
                </li>
            </ul>
        </section>
        <footer class="ui-footer ui-footer-stable">
            <button class="btn-wq-lg bgffb400 cf" @click="confirm()">确定</button>
        </footer>
    </div>
</template>
<style lang="css">

    /*.bottom-liner{*/
    /*}*/

</style>
<script>
    import Vue from "vue";
    import config from "../../env/config.js";

    export default {
        props: ["showSelect","checkedProductList"],
        data: function () {
            return{
                keyword:'',
                productList:[],
                pageNo:1,//当前页
                pageSize:10,//当页显示数量

                checkedList:[]//选中的商品id
            }
        },

        ready:function () {
//            this.getTagList();
        },
        methods: {
            //获取搜索結果
            submitSearch: function () {
                var params = {
                    keyword: this.keyword,//搜索关键字
                    companyId: Vue.mallSettings.getCompanyId(),//公司id
                    pageNo: this.pageNo,//当前页
                    pageSize: this.pageSize,//当页显示数量
                    platformId: config.platformId,
                    areaCode: Vue.localStorage.getItem('locationInfo')?Vue.localStorage.getItem('locationInfo').region.code:'',
                };
//                http://lyf.dev.odianyun.com/api/search/searchList
                Vue.api.get(config.apiHost + '/api/search/searchList', params, (result)=> {
                    if (result.data){
                        var pro=result.data;
                        this.productList=pro.productList;
                        for(var i in this.productList){
                            Vue.set(this.productList[i], 'disabled', false);
                            Vue.set(this.productList[i], 'checked', false);
                        }
                    }
                }, (res) => {
                    Vue.api._showError(res.message);
                })
            },
            deleteSearch:function () {
                this.keyword='';
            },
            //关闭选择标签
            closeTag:function () {
                this.showSelect=!this.showSelect;
            },
            checkProd: function(item){
                item.checked = !item.checked;

                if(this.checkedList.length == 3){
                     for(var i in this.productList){
                        if(!this.productList[i].checked) Vue.set(this.productList[i], 'disabled', true);
                     }
                     Vue.utils.showTips("最多只能选择3件商品");
                }else{
                    for(var i in this.productList){
                        Vue.set(this.productList[i], 'disabled', false);
                    }
                }
            },
            confirm:function () {
                //替换 2017.01.20 需求
                this.checkedProductList = [];
                for (var i=0;i<this.checkedList.length;i++){
                    if (this.checkedProductList){
                        if(this.productList&&this.productList.length>0){
                            for (var k=0;k<this.productList.length;k++){
                                if (this.checkedList[i]==this.productList[k].mpId){
                                    this.checkedProductList.push(this.productList[k]);
                                }
                            }
                        }
                    }
                }
                this.closeTag();
            }
        }
    }
</script>
