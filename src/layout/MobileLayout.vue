<template>
  <div class="mobile-app">
    <router-view v-slot="{ Component }">
      <transition name="slide" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <van-tabbar v-model="active" route active-color="#2da64a" inactive-color="#969799">
      <van-tabbar-item to="/m" icon="wap-home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/m/supply" icon="add-o">发布</van-tabbar-item>
      <van-tabbar-item to="/m/orders" icon="balance-list-o">收购单</van-tabbar-item>
      <van-tabbar-item to="/m/notice" icon="bell">消息</van-tabbar-item>
      <van-tabbar-item to="/m/me" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const active = ref(0)
</script>

<style scoped>
.mobile-app { max-width: 500px; margin: 0 auto; min-height: 100vh; background: #f7f8fa; padding-bottom: 50px; position: relative; }
.slide-enter-active, .slide-leave-active { transition: all .2s; }
.slide-enter-from { opacity: 0; transform: translateX(10px); }
.slide-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
