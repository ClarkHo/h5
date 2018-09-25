import Vue from "vue";
import UiHeader from "../../components/ui-header.vue";
import config from "../../../env/config.js";



var vm = new Vue({
    el: 'body',
    components: { UiHeader },
    data: {
        ut: Vue.auth.getUserToken(),
        msgSummary:[],//消息列表
        isApp: Vue.browser.isApp(),
        time:'',
        content:'',
        count:0,
        kfConfig: null//客服配置
    },
    ready: function() {
        this.getMsgSummary();
        //this.kefu();
        Vue.event.on("pageShow", this.pageShowHandler);

        window.onpageshow =  () => {
            //this.kefu();
            this.getMsgSummary()
        }
    },
    methods: {
        getMsgSummary:function(){
            var params = {
                ut: this.ut,
                cashe:Date.parse(new Date())
            };
            Vue.api.get(config.apiHost + "/api/social/vl/message/getMsgSummary", params, (result) => {
                this.msgSummary = (result.data instanceof Array) ? [...result.data] : [result.data];

                for (var i = 0; i < this.msgSummary.length; i++) {

                    if (this.msgSummary[i].messageType  == 1) {
                        //1 系统消息 2 活动消息
                        this.msgSummary[i].url = "/message/message-stream.html";
                        // this.msgSummary[i].className = "icon-msg-stream";
                    }
                    else if (this.msgSummary[i].messageType  == 2) {
                        this.msgSummary[i].url = "/message/message-activity.html";
                        this.msgSummary[i].className = "icon-msg-activity";
                    }
                }
            },(error) => {

            });
        },
        pageShowHandler: function (res) {
            //this.kefu();
            this.getMsgSummary();
        },
        //客服小一
        kefu:function(){
            var that = this;
            if(Vue.browser.isApp()) {
                Vue.app.postMessage("getMessageInfo", null, (res)=>{

                    if(typeof res != 'object') {
                        res=JSON.parse(res);
                    }
                    if(res.lastMsg.time) {
                        this.time=res.lastMsg.time * 1000;
                    }
                    this.content=res.lastMsg.content;
                    this.count=res.count
                });
            }else if(!Vue.browser.weixin()) {
                this.getKFConfig((data) => {
                    var sdk = new WSDK();
                    sdk.Base.login({
                        uid: localStorage.username,
                        appkey: data.appKey,
                        credential: data.password,
                        timeout: 5000,
                        success: function(data){
                            sdk.Base.getUnreadMsgCount({
                                //count: 10, //很奇怪的接口，获取未读消息个数还要传count参数
                                success: function(res){
                                    //console.log('get unread msg count success' ,res);
                                    if(res.code == 1000 && res.data && res.data[0]) {
                                        that.count = res.data[0].msgCount;
                                        that.time = res.data[0].lastmsgTime * 1000;
                                    }
                                },
                                error: function(error){
                                    //console.log('get unread msg count fail' ,error);
                                }
                            });
                        },
                        error: function(error){
                           //console.log('login fail', error);
                        }
                    });
                });

            }

        },
        //获取用户头像
        getUserHeadPic: function (callback) {
            var headPic = Vue.sessionStorage.getItem('kf_head_pic');
            if(headPic) {
                if(typeof callback == 'function') {
                    callback();
                }
            }else {
                var url = config.apiHost + '/api/my/user/info';
                var param = {
                    ut: Vue.auth.getUserToken(),
                    companyId: Vue.mallSettings.getCompanyId()
                };
                Vue.api.postForm(url, param, (res) => {
                    Vue.sessionStorage.setItem('kf_head_pic', res.data.url100x100);
                    if(typeof callback == 'function') {
                        callback();
                    }
                });
            }

        },
        //获取客服配置
        getKFConfig: function (callback) {
            if(this.kfConfig) {
                if(typeof callback == 'function') {
                    callback(this.kfConfig);
                }
            }else {
                var url = '/admin-web/getTaoBaoOpenIM.json';
                var params = {
                    platform: config.platform,
                    areaCode: Vue.area.getArea().aC,
                    platformId: config.platformId,
                    sessionId: Vue.session.getSessionId(),
                    userId: Vue.localStorage.getItem('username'),
                    companyId: Vue.mallSettings.getCompanyId()
                };
                Vue.api.get(url, params, (res) => {
                    if(res.data.appKey && res.data.password && res.data.receiveId) {
                        this.kfConfig = {
                            appKey: res.data.appKey,
                            password: res.data.password,
                            receiveId: res.data.receiveId
                        }
                        if(typeof callback == 'function') {
                            callback(this.kfConfig);
                        }
                    }
                }, ()=> {

                });
            }

        },
        goCustomService:function () {
            if(Vue.browser.isApp()) {
                Vue.app.postMessage("callcustomservice");
            }else if(Vue.browser.weixin()) {
                var dia=$.dialog({
                    title:'温馨提示',
                    content:'请点击右上角菜单选择“在浏览器打开”',
                    button:["知道了"]
                });
            }else {
                this.getKFConfig((data) => {
                    this.getUserHeadPic(() => {
                        location.href = '/kf.html?ak=' + data.appKey +
                                        '&pwd=' + data.password +
                                        '&rid=' + data.receiveId;
                    });

                });
            }
        }

    }
});
