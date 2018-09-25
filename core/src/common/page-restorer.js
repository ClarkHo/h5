import Vue from "vue";

//记录滚动条的位置
const POS_PREFIX = "scroll_pos_";
//记录相关的数据
const DATA_PREFIX = "scroll_data_";
//记录当前的url
const URL_PREFIX = "scroll_url_";
//记录存储数据的时间
const TIME_PREFIX = "scroll_time_";
//默认数据过期时间 (2分钟)
const EXPIRE_TIME = 1000 * 60 * 2;

/**
 * 恢复页面的保存的状态并且恢复滚动条的位置
 */
class PageRestorer {
    /**
     * 初始化，必须先调用该方法。
     * @param vm Vue对象实例 (必填)
     * @param  page 页面的唯一标识 （必填）
     * @param expireTime 过期时间（毫秒数，可选。默认2分钟）
     */
    init(vm, page, expireTime) {
        this.vm = vm;
        this.page = page;
        this.expireTime = expireTime || EXPIRE_TIME;
        this.posKey = POS_PREFIX + page;
        this.dataKey = DATA_PREFIX + page;
        this.urlKey = URL_PREFIX + page;
        this.timeKey = TIME_PREFIX + page;

        //处理滚动事件
        $(window).on("scroll", () => {
            window.sessionStorage[this.posKey] = document.body.scrollTop;
            window.sessionStorage[this.urlKey] = window.location.href;
            window.sessionStorage[this.dataKey] = JSON.stringify(vm.$data);
            window.sessionStorage[this.timeKey] = (new Date()).getTime();
        });
    }

    /**
     * 恢复页面的状态
     * 如果缓存的数据被restore返回true，否则返回false
     * Note: 一般返回false时需要调用初始化页面数据的方法
     */
    restore() {
        let url = this.getUrl();
        let pos = this.getPosition();
        //url必须完全匹配
        if (pos>0 && url == window.location.href) {
            let cachedData = this.getData();
            let expiredTime = this.getTime() + this.expireTime;
            let now = (new Date()).getTime();
            //不处理已过期的数据
            if (cachedData && now < expiredTime) {
                this.vm.$data = cachedData;
                setTimeout(function () {
                    window.scrollTo(0, parseInt(pos));
                }, 500);
                
                this.clear();
                return true;
            }
        }

        this.clear();
        return false;
    }

    /**
     * 获取存储的url
     */
    getUrl() {
        return window.sessionStorage[this.urlKey];
    }

    /**
     * 获取记录的滚动条位置信息
     */
    getPosition() {
        return window.sessionStorage[this.posKey];
    }

    /**
     * 获取保存的数据（没有返回null）
     */
    getData() {
        let data = window.sessionStorage[this.dataKey];
        return data ? JSON.parse(data) : null;
    }

    /**
     * 获取存储的时间
     */
    getTime() {
        let t = window.sessionStorage[this.timeKey];
        return t ? parseFloat(t) : 0;
    }

    /**
     * 清除关联的数据
     */
    clear() {
        window.sessionStorage.removeItem(this.urlKey);
        window.sessionStorage.removeItem(this.posKey);
        window.sessionStorage.removeItem(this.dataKey);
        window.sessionStorage.removeItem(this.timeKey);
    }

}

//注册全局变量
Vue.pageRestorer = new PageRestorer();
