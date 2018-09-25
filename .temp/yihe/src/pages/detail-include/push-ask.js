import Vue from "vue";
import config from "../../../env/config.js";
import UiHeader from "../../components/ui-header.vue";


let urlParams = Vue.utils.paramsFormat(window.location.href);

new Vue({
    el: 'body',
    components: { UiHeader},
    data: {
      windowWidth:'365',
      mpId:urlParams.mpId || '',
      itemInfo:'',
      askContent:'',
      submitting: false
    },
    computed: {
      mainPic: function(){
        if(this.itemInfo && this.itemInfo.pics && this.itemInfo.pics.length > 0){
          return this.itemInfo.pics[0].url60x60;
        } else{
          return "${staticPath}/images/pro-img.png?v=${version}";
        }
      }
    },
    ready: function() {
      this.windowWidth = document.body.scrollWidth;
      this.getBaseInfo();
    },
    methods: {
      getBaseInfo:function (params) {
        var url = config.apiHost + '/api/product/baseInfo';
        var params = {
          mpsIds:this.mpId,
          platformId: config.platformId,
          areaCode: Vue.area.getArea().aC,
        }
        Vue.api.get(url, params, (res) => {
          if(res.data){
            this.itemInfo = res.data[0];
          }
        })
      },
      pushAsk:function (params) {
        if(this.submitting){
          Vue.utils.showTips('你点的太快啦');
          return;
        }
        if(!this.askContent){
          Vue.utils.showTips('请输入提问的内容');
          return;
        }
        var url = '/back-product-web/consultAppAction/insertNewQA.do';
        var params ={
          merchantProductId:this.mpId,
          content:this.askContent,
        }
        this.submitting = true;
        Vue.api.post(url, params, (res) => {
          Vue.utils.showTips('发布成功');
          setTimeout(() => {
            history.back();
          }, 1000);
        })
      }
    }
});