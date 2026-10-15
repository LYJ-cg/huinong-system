<template>
  <div class="page">
    <div class="profile">
      <van-image round width="60" height="60" src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" />
      <div class="p-name">{{ farmer.farmer_name }}</div>
      <van-tag type="success" size="medium">已实名认证</van-tag>
    </div>
    <van-cell-group inset style="margin-top:12px">
      <van-cell title="联系电话" :value="farmer.phone" />
      <van-cell title="身份证号" :value="farmer.id_card" />
      <van-cell title="家庭住址" :value="farmer.address || '-'" />
      <van-cell title="银行卡号" :value="farmer.bank_card || '-'" />
      <van-cell title="备注" :value="farmer.remark || '-'" />
      <van-cell title="注册时间" :value="farmer.create_time" />
    </van-cell-group>
    <div class="links">
      <van-cell-group inset>
        <van-cell title="发布供货" is-link @click="$router.push('/m/supply')" />
        <van-cell title="我的收购单" is-link @click="$router.push('/m/orders')" />
        <van-cell title="结算查询" is-link @click="$router.push('/m/settlement')" />
      </van-cell-group>
    </div>
    <div style="margin:20px 16px"><van-button round block type="danger" plain @click="logout">退出登录</van-button></div>
    <div class="ver">惠农物资管理系统 · 农户移动端 v1.0</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
const router = useRouter(); const auth = useAuthStore()
const farmer = auth.farmer || {}
function logout() { auth.logout(); router.push('/m/login') }
</script>

<style scoped>
.page { min-height: 100vh; background: #f7f8fa; }
.profile { background: linear-gradient(135deg, #2da64a, #1e7d36); color: #fff; text-align: center; padding: 30px 16px 24px; }
.p-name { font-size: 20px; font-weight: 700; margin: 10px 0 8px; }
.links { margin-top: 12px; }
.ver { text-align: center; color: #c8c9cc; font-size: 12px; padding-bottom: 20px; }
</style>
