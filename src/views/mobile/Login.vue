<template>
  <div class="login-page">
    <div class="banner">
      <van-icon name="flower-o" size="50" color="#fff" />
      <h1>惠农助农</h1>
      <p>农户移动端 · 卖货更轻松</p>
    </div>
    <div class="form-box">
      <van-cell-group inset>
        <van-field v-model="form.phone" label="手机号" placeholder="请输入手机号" type="digit" clearable />
        <van-field v-model="form.idCard" label="身份证号" placeholder="请输入身份证号" clearable />
      </van-cell-group>
      <div class="btn-area">
        <van-button type="success" block round :loading="loading" @click="onLogin">登录</van-button>
        <van-button plain block round hairline @click="$router.push('/m/register')">新农户注册</van-button>
      </div>
      <div class="demo">
        <p>演示账号（实名认证已通过）</p>
        <van-tag type="success" plain @click="fill('13900000001','330102199001011234')">张三 13900000001</van-tag>
        <van-tag type="warning" plain @click="fill('13900000002','330102199203032345')">李四 13900000002</van-tag>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useAuthStore } from '@/store/auth'
const router = useRouter(); const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ phone: '', idCard: '' })
function fill(p, id) { form.phone = p; form.idCard = id }
async function onLogin() {
  if (!form.phone || !form.idCard) return showFailToast('请填写完整')
  loading.value = true
  const res = await auth.farmerLogin(form.phone, form.idCard)
  loading.value = false
  if (res.ok) { showSuccessToast('登录成功'); router.push('/m') }
  else showFailToast(res.msg)
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #f7f8fa; }
.banner { background: linear-gradient(135deg, #2da64a, #1e7d36); color: #fff; text-align: center; padding: 50px 20px 36px; }
.banner h1 { font-size: 26px; margin: 12px 0 4px; }
.banner p { opacity: .9; font-size: 14px; }
.form-box { margin-top: -18px; padding: 0 12px; }
.btn-area { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.demo { text-align: center; margin-top: 8px; }
.demo p { font-size: 12px; color: #969799; margin-bottom: 8px; }
.demo .van-tag { margin: 0 6px; cursor: pointer; }
</style>
