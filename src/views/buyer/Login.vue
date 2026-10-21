<template>
  <div class="login-wrap">
    <div class="login-card">
      <h2 class="title">惠农采购通 · 买方登录</h2>
      <el-form :model="form" label-width="0" size="large">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名（buyer1 / buyer2）" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" show-password placeholder="密码（默认 123456）" :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" class="submit" :loading="loading" @click="doLogin">登录</el-button>
      </el-form>
      <div class="footer-links">
        <router-link to="/buyer/register">还没有账号？立即注册 →</router-link>
        <router-link to="/admin/login">← 管理端登录</router-link>
      </div>
      <el-alert title="演示账号：buyer1/123456 / buyer2/123456（已审核通过）" type="info" :closable="false" show-icon style="margin-top:16px" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ username: '', password: '' })

async function doLogin() {
  if (!form.username || !form.password) return ElMessage.warning('请填写完整')
  loading.value = true
  const res = await auth.buyerLogin(form.username, form.password)
  loading.value = false
  if (res.ok) { ElMessage.success('登录成功'); router.push('/buyer') }
  else ElMessage.error(res.msg)
}
</script>

<style scoped>
.login-wrap { min-height: 100vh; background: linear-gradient(135deg,#0a543a 0%,#1f3d2b 100%); display: flex; align-items: center; justify-content: center; }
.login-card { width: 380px; background: #fff; border-radius: 10px; padding: 32px; box-shadow: 0 8px 40px rgba(0,0,0,.2); }
.title { text-align: center; margin: 0 0 20px; color: #0a543a; }
.submit { width: 100%; }
.footer-links { display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px; }
.footer-links a { color: #0a543a; text-decoration: none; }
</style>
