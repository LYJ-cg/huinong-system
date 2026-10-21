<template>
  <div class="login-wrap">
    <div class="login-card">
      <h2 class="title">买方注册</h2>
      <el-form :model="form" label-width="100px" size="default" :rules="rules" ref="formRef">
        <el-form-item label="买方名称" prop="buyer_name"><el-input v-model="form.buyer_name" placeholder="如：绿源加工厂" /></el-form-item>
        <el-form-item label="联系人" prop="contact"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="手机号" prop="phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="买方类型" prop="buyer_type">
          <el-select v-model="form.buyer_type" style="width:100%">
            <el-option label="批发商" value="批发商" />
            <el-option label="商超" value="商超" />
            <el-option label="电商" value="电商" />
            <el-option label="加工企业" value="加工企业" />
            <el-option label="个人" value="个人" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址" prop="address"><el-input v-model="form.address" /></el-form-item>
        <el-form-item label="登录账号" prop="username"><el-input v-model="form.username" placeholder="后续用此用户名登录" /></el-form-item>
        <el-form-item label="登录密码" prop="password"><el-input v-model="form.password" type="password" show-password /></el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit" :loading="loading" @click="doRegister">提交注册</el-button>
        </el-form-item>
      </el-form>
      <div class="footer-links"><router-link to="/buyer/login">← 返回登录</router-link></div>
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
const loading = ref(false)
const formRef = ref()
const form = reactive({ buyer_name: '', contact: '', phone: '', buyer_type: '批发商', address: '', username: '', password: '123456' })
const rules = {
  buyer_name: [{ required: true, message: '请填写买方名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请填写手机号', trigger: 'blur' }],
  username: [{ required: true, message: '请填写登录账号', trigger: 'blur' }]
}
async function doRegister() {
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    const res = await auth.buyerRegister(form)
    loading.value = false
    if (res.ok) { ElMessage.success(res.msg); router.push('/buyer/login') }
    else ElMessage.error(res.msg)
  })
}
</script>
<style scoped>
.login-wrap { min-height: 100vh; background: linear-gradient(135deg,#0a543a 0%,#1f3d2b 100%); display: flex; align-items: center; justify-content: center; }
.login-card { width: 440px; background: #fff; border-radius: 10px; padding: 32px; box-shadow: 0 8px 40px rgba(0,0,0,.2); }
.title { text-align: center; margin: 0 0 20px; color: #0a543a; }
.submit { width: 100%; }
.footer-links { text-align: center; margin-top: 12px; }
.footer-links a { color: #0a543a; text-decoration: none; }
</style>
