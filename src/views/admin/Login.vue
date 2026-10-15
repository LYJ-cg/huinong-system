<template>
  <div class="login-bg">
    <div class="login-box">
      <div class="left-banner">
        <div class="banner-inner">
          <h1>惠农物资管理系统</h1>
          <p class="subtitle">产 · 收 · 储 · 销 · 结算 一体化闭环</p>
          <ul class="features">
            <li><el-icon><CircleCheckFilled /></el-icon> 农产品收购全流程数字化</li>
            <li><el-icon><CircleCheckFilled /></el-icon> 基于保鲜期的临期预警防积压</li>
            <li><el-icon><CircleCheckFilled /></el-icon> 收购单全链路追溯留痕</li>
            <li><el-icon><CircleCheckFilled /></el-icon> 价格透明助农增收</li>
          </ul>
          <p class="tip">农户移动端入口：<a href="#/m/login" target="_blank">点击进入农户H5</a></p>
        </div>
      </div>
      <div class="right-form">
        <h2>管理端登录</h2>
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="form.username" prefix-icon="User" placeholder="请输入用户名" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" prefix-icon="Lock" type="password" show-password placeholder="请输入密码" size="large" @keyup.enter="onLogin" />
          </el-form-item>
          <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="onLogin">登 录</el-button>
        </el-form>
        <div class="quick-account">
          <p class="qa-title">演示账号（点击快速填充）</p>
          <el-space wrap>
            <el-tag class="tag" @click="fill('admin','123456')" type="danger" effect="dark">系统管理员 admin</el-tag>
            <el-tag class="tag" @click="fill('buyer','123456')" type="success" effect="dark">收购点 buyer</el-tag>
            <el-tag class="tag" @click="fill('sale','123456')" type="warning" effect="dark">销售员 sale</el-tag>
          </el-space>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
function fill(u, p) { form.username = u; form.password = p }
async function onLogin() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    const res = await auth.adminLogin(form.username, form.password)
    loading.value = false
    if (res.ok) {
      ElMessage.success('登录成功')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error(res.msg)
    }
  })
}
</script>

<style scoped>
.login-bg { height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #1f3d2b 0%, #2da64a 100%); }
.login-box { width: 880px; max-width: 94%; height: 520px; display: flex; border-radius: 14px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.3); }
.left-banner { flex: 1.1; background: linear-gradient(160deg, rgba(30,61,43,.92), rgba(45,166,74,.85)), url('https://trae-api-cn.mchost.guru/api/ide/v1/tool_text_to_image?prompt=lush%20green%20farmland%20vegetable%20greenhouse%20rural%20china%20aerial%20view%20sunny&image_size=landscape_16_9'); background-size: cover; color: #fff; padding: 50px 40px; display: flex; align-items: center; }
.banner-inner h1 { font-size: 30px; margin-bottom: 10px; }
.subtitle { font-size: 16px; opacity: .9; margin-bottom: 30px; }
.features { list-style: none; }
.features li { display: flex; align-items: center; gap: 8px; margin: 14px 0; font-size: 15px; }
.features .el-icon { color: #ffd24a; font-size: 18px; }
.tip { margin-top: 30px; font-size: 13px; opacity: .9; }
.tip a { color: #ffd24a; }
.right-form { flex: 1; background: #fff; padding: 50px 44px; display: flex; flex-direction: column; justify-content: center; }
.right-form h2 { margin-bottom: 24px; color: #1f3d2b; font-size: 24px; }
.login-btn { width: 100%; background: var(--hn-green); border-color: var(--hn-green); margin-top: 8px; }
.quick-account { margin-top: 24px; border-top: 1px dashed #eee; padding-top: 16px; }
.qa-title { font-size: 12px; color: #999; margin-bottom: 10px; }
.tag { cursor: pointer; }
@media (max-width: 768px) {
  .login-box { flex-direction: column; height: auto; width: 92%; }
  .left-banner { padding: 30px; }
  .right-form { padding: 30px; }
}
</style>
