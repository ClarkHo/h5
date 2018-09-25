/**
 * LocalStorageWrapper
 */
import Vue from "vue";

class LocalStorageWrapper {
    constructor() {
        this.supportLocalStorage = typeof window.localStorage != "undefined";
        this.localStorage = window.localStorage || {};
    }

    //获取指定key的数据
    getItem(key) {
        if (this.contains(key)) {
            return JSON.parse(this.localStorage[key]);
        }

        return null;
    }

    //检查是否有指定key的数据
    contains(key) {
        return this.localStorage.hasOwnProperty(key);
    }

    //存储数据
     setItem(key, value) {
            this.localStorage[key] = JSON.stringify(value);
    }

    //删除指定key的数据
    removeItem(key) {
        if (!key) {
            return;
        }

        if (this.supportLocalStorage) {
            this.localStorage.removeItem(key);
        } else {
            delete this.localStorage[key];
        }
    }

    //清空localStore对象里的数据
    clear() {
        if (this.supportLocalStorage) {
             this.localStorage.clear();
         }else {
            this.localStorage = {};
         }
    }
}

Vue.localStorage = new LocalStorageWrapper();
