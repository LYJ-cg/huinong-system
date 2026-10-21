<template>
  <div class="login-page">
    <div class="login-shell">
      <!-- 左侧：品牌 + 角色选择 -->
      <aside class="brand-side">
        <div class="brand">
          <div class="logo"><el-icon><Sunny /></el-icon></div>
          <div class="brand-text">
            <h1>惠农物资管理系统</h1>
            <p>产 · 收 · 储 · 销 · 结算 一体化平台</p>
          </div>
        </div>

        <div class="role-list">
          <button
            v-for="r in roles"
            :key="r.key"
            type="button"
            class="role-item"
            :class="{ active: activeRole === r.key }"
            @click="switchRole(r.key)"
          >
            <el-icon class="role-ico"><component :is="r.icon" /></el-icon>
            <span class="role-text">
              <span class="role-name">{{ r.name }}</span>
              <span class="role-desc">{{ r.desc }}</span>
            </span>
            <el-icon class="role-arrow"><ArrowRight /></el-icon>
          </button>
        </div>

        <p class="brand-foot">所有角色共用同一数据中心</p>
      </aside>

      <!-- 右侧：登录表单 -->
      <main class="form-side">
        <div class="form-inner">
          <header class="form-head">
            <h2>{{ current.title }}</h2>
            <p>{{ current.hint }}</p>
          </header>

          <!-- 管理端 -->
          <el-form
            v-if="activeRole === 'admin'"
            ref="adminRef"
            :model="adminForm"
            :rules="adminRules"
            size="large"
            @submit.prevent
          >
            <el-form-item prop="username">
              <el-input v-model="adminForm.username" prefix-icon="User" placeholder="用户名" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="adminForm.password"
                prefix-icon="Lock"
                type="password"
                show-password
                placeholder="密码"
                @keyup.enter="login"
              />
            </el-form-item>
          </el-form>

          <!-- 农户端 -->
          <el-form
            v-else-if="activeRole === 'farmer'"
            ref="farmerRef"
            :model="farmerForm"
            :rules="farmerRules"
            size="large"
            @submit.prevent
          >
            <el-form-item prop="phone">
              <el-input v-model="farmerForm.phone" prefix-icon="Phone" placeholder="手机号" />
            </el-form-item>
            <el-form-item prop="idCard">
              <el-input
                v-model="farmerForm.idCard"
                prefix-icon="Postcard"
                placeholder="身份证号"
                @keyup.enter="login"
              />
            </el-form-item>
          </el-form>

          <!-- 买方端 -->
          <el-form
            v-else
            ref="buyerRef"
            :model="buyerForm"
            :rules="buyerRules"
            size="large"
            @submit.prevent
          >
            <el-form-item prop="username">
              <el-input v-model="buyerForm.username" prefix-icon="User" placeholder="用户名" />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="buyerForm.password"
                prefix-icon="Lock"
                type="password"
                show-password
                placeholder="密码"
                @keyup.enter="login"
              />
            </el-form-item>
          </el-form>

          <el-button class="submit" :class="`submit-${activeRole}`" :loading="loading" @click="login">
            登 录
          </el-button>

          <p class="demo-line">
            演示账号
            <button type="button" class="demo-link" @click="fillDemo">{{ current.demo }}</button>
          </p>

          <p v-if="activeRole !== 'admin'" class="register-line">
            {{ activeRole === 'farmer' ? '还没有农户账号？' : '还没有买方账号？' }}
            <router-link :to="activeRole === 'farmer' ? '/m/register' : '/buyer/register'">
              立即注册
            </router-link>
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UserFilled, Sunny, ShoppingBag, ArrowRight } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const auth = useAuthStore()

const roles = [
  { key: 'admin', name: '管理端', desc: '管理员 · 收购 · 销售', icon: UserFilled, demo: 'admin / 123456' },
  { key: 'farmer', name: '农户端', desc: '发布供货 · 查询结算', icon: Sunny, demo: '张三 / 13900000001' },
  { key: 'buyer', name: '买方端', desc: '在线预订 · 追踪进度', icon: ShoppingBag, demo: 'buyer1 / 123456' }
]

const meta = {
  admin: { title: '登录管理端', hint: '系统管理员 / 收购管理员 / 销售管理员' },
  farmer: { title: '登录农户端', hint: '手机号与身份证号实名认证登录' },
  buyer: { title: '登录买方端', hint: '批发商 · 商超 · 电商 · 加工企业' }
}

const activeRole = ref('admin')
const loading = ref(false)
const current = computed(() => ({
  ...meta[activeRole.value],
  demo: roles.find(r => r.key === activeRole.value).demo
}))

const adminRef = ref()
const farmerRef = ref()
const buyerRef = ref()

const adminForm = reactive({ username: '', password: '' })
const farmerForm = reactive({ phone: '', idCard: '' })
const buyerForm = reactive({ username: '', password: '' })

const adminRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
const farmerRules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  idCard: [{ required: true, message: '请输入身份证号', trigger: 'blur' }]
}
const buyerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

function switchRole(key) {
  if (activeRole.value === key) return
  activeRole.value = key
}

function fillDemo() {
  if (activeRole.value === 'admin') {
    adminForm.username = 'admin'
    adminForm.password = '123456'
  } else if (activeRole.value === 'farmer') {
    farmerForm.phone = '13900000001'
    farmerForm.idCard = '330102199001011234'
  } else {
    buyerForm.username = 'buyer1'
    buyerForm.password = '123456'
  }
}

async function login() {
  const role = activeRole.value
  const formRef = role === 'admin' ? adminRef.value : role === 'farmer' ? farmerRef.value : buyerRef.value
  try {
    await formRef.validate()
  } catch {
    return
  }

  loading.value = true
  let res
  try {
    if (role === 'admin') res = await auth.adminLogin(adminForm.username, adminForm.password)
    else if (role === 'farmer') res = await auth.farmerLogin(farmerForm.phone, farmerForm.idCard)
    else res = await auth.buyerLogin(buyerForm.username, buyerForm.password)
  } finally {
    loading.value = false
  }

  if (!res || !res.ok) {
    ElMessage.error((res && res.msg) || '登录失败')
    return
  }

  ElMessage.success('登录成功')
  router.push(role === 'admin' ? '/admin/dashboard' : role === 'farmer' ? '/m' : '/buyer')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: radial-gradient(1200px 600px at 15% 0%, #eef4f0 0%, #f6f8f7 45%, #eef1ef 100%);
}

.login-shell {
  display: grid;
  grid-template-columns: 360px 1fr;
  width: 100%;
  max-width: 920px;
  min-height: 540px;
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 70px -30px rgba(14, 45, 33, .30), 0 2px 10px rgba(14, 45, 33, .05);
}

/* 左侧品牌区 */
.brand-side {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 40px 32px 32px;
  color: #fff;
  background: linear-gradient(165deg, #0b4632 0%, #0e5940 55%, #12694a 100%);
  overflow: hidden;
}
.brand-side::after {
  content: '';
  position: absolute;
  right: -90px;
  bottom: -110px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, .09) 0%, rgba(255, 255, 255, 0) 70%);
  pointer-events: none;
  z-index: 0;
}

.brand {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}
.logo {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  font-size: 21px;
  color: #ffe08a;
  background: rgba(255, 255, 255, .13);
  border: 1px solid rgba(255, 255, 255, .16);
}
.brand-text h1 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: .3px;
}
.brand-text p {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: rgba(255, 255, 255, .6);
  letter-spacing: .2px;
}

/* 角色选择 */
.role-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  font-family: inherit;
  text-align: left;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 11px;
  cursor: pointer;
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.role-item:hover {
  background: rgba(255, 255, 255, .07);
  border-color: rgba(255, 255, 255, .24);
}
.role-item.active {
  background: rgba(255, 255, 255, .14);
  border-color: rgba(255, 255, 255, .42);
  box-shadow: 0 4px 14px -4px rgba(0, 0, 0, .28);
}
.role-ico {
  font-size: 19px;
  color: rgba(255, 255, 255, .82);
}
.role-item.active .role-ico {
  color: #ffe08a;
}
.role-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.role-name {
  font-size: 14px;
  font-weight: 500;
}
.role-desc {
  font-size: 11.5px;
  color: rgba(255, 255, 255, .55);
}
.role-item.active .role-desc {
  color: rgba(255, 255, 255, .72);
}
.role-arrow {
  margin-left: auto;
  font-size: 13px;
  color: rgba(255, 255, 255, .35);
}
.role-item.active .role-arrow {
  color: rgba(255, 255, 255, .7);
}

.brand-foot {
  position: relative;
  z-index: 1;
  margin: auto 0 0;
  font-size: 11px;
  color: rgba(255, 255, 255, .38);
}

/* 右侧表单区 */
.form-side {
  display: flex;
  align-items: center;
  padding: 56px 60px;
}
.form-inner {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}
.form-head {
  margin-bottom: 28px;
}
.form-head h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #17251e;
  letter-spacing: .2px;
}
.form-head p {
  margin: 8px 0 0;
  font-size: 13px;
  color: #94a29b;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}
:deep(.el-input__wrapper) {
  padding: 4px 14px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e3e8e5 inset;
  background: #fbfcfb;
  transition: box-shadow .2s, background .2s;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cad6cf inset;
}
:deep(.el-input__wrapper.is-focus) {
  background: #fff;
  box-shadow: 0 0 0 1px #12694a inset, 0 0 0 3px rgba(18, 105, 74, .1);
}
:deep(.el-input__inner) {
  height: 42px;
  font-size: 14px;
}

.submit {
  width: 100%;
  height: 46px;
  margin-top: 6px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 4px;
  border: none;
  border-radius: 10px;
  color: #fff;
  background: #12694a;
  transition: background .2s, transform .1s;
}
.submit:hover {
  background: #0e5c40;
}
.submit:active {
  transform: translateY(1px);
}
.submit-farmer {
  background: #c47a1c;
}
.submit-farmer:hover {
  background: #ad6b16;
}
.submit-buyer {
  background: #2563c9;
}
.submit-buyer:hover {
  background: #1f55ae;
}

.demo-line {
  margin: 22px 0 0;
  font-size: 12.5px;
  color: #a3afa9;
  text-align: center;
}
.demo-link {
  padding: 0 0 0 4px;
  font-family: inherit;
  font-size: 12.5px;
  color: #12694a;
  background: none;
  border: none;
  border-bottom: 1px dashed rgba(18, 105, 74, .45);
  cursor: pointer;
}
.demo-link:hover {
  color: #0e5c40;
}

.register-line {
  margin: 22px 0 0;
  padding-top: 20px;
  font-size: 13px;
  color: #94a29b;
  text-align: center;
  border-top: 1px solid #f0f3f1;
}
.register-line a {
  color: #12694a;
  font-weight: 500;
  text-decoration: none;
}
.register-line a:hover {
  text-decoration: underline;
}

@media (max-width: 860px) {
  .login-page {
    padding: 0;
  }
  .login-shell {
    grid-template-columns: 1fr;
    max-width: 520px;
    min-height: auto;
    border-radius: 16px;
  }
  .brand-side {
    padding: 26px 24px 22px;
  }
  .brand {
    margin-bottom: 20px;
  }
  .role-list {
    flex-direction: row;
    gap: 8px;
  }
  .role-item {
    flex: 1;
    flex-direction: column;
    gap: 6px;
    padding: 12px 6px;
    text-align: center;
  }
  .role-text {
    gap: 0;
  }
  .role-name {
    font-size: 13px;
  }
  .role-desc,
  .role-arrow,
  .brand-foot {
    display: none;
  }
  .form-side {
    padding: 32px 24px 36px;
  }
  .form-head {
    margin-bottom: 22px;
  }
}
</style>
