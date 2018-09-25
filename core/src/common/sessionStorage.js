/**
 * SessionStorageWrapper
 */
import Vue from "vue";

class SessionStorageWrapper {
    constructor() {
        this.supportSessionStorage = typeof window.sessionStorage != "undefined";
        this.sessionStorage = window.sessionStorage || {};
    }

    //获取指定key的数据
    getItem(key) {
        if (this.contains(key)) {
            return JSON.parse(this.sessionStorage[key]);
        }

        return null;
    }

    //检查是否有指定key的数据
    contains(key) {
        return this.sessionStorage.hasOwnProperty(key);
    }

    //存储数据
     setItem(key, value) {
            this.sessionStorage[key] = JSON.stringify(value);
    }

    //删除指定key的数据
    removeItem(key) {
        if (!key) {
            return;
        }

        if (this.supportSessionStorage) {
            this.sessionStorage.removeItem(key);
        } else {
            delete this.sessionStorage[key];
        }
    }

    //清空localStore对象里的数据
    clear() {
        if (this.supportSessionStorage) {
             this.sessionStorage.clear();
         }else {
            this.sessionStorage = {};
         }
    }
}

Vue.sessionStorage = new SessionStorageWrapper();
