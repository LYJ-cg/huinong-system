<template>
  <div class="login-page">
    <!-- 顶部栏 -->
    <div class="login-header">
      <div class="container hd-row">
        <router-link to="/" class="brand">
          <div class="brand-logo"><el-icon><Sunny /></el-icon></div>
          <div class="brand-text">
            <div class="brand-name">惠农物资管理系统</div>
            <div class="brand-desc">欢迎登录</div>
          </div>
        </router-link>
        <div class="hd-right">
          <router-link to="/" class="hd-back">← 返回商品首页</router-link>
        </div>
      </div>
    </div>

    <!-- 表单主体 -->
    <div class="login-body">
      <div class="login-card">
        <!-- 角标 -->
        <button v-if="activeRole !== 'buyer'" type="button" class="back-link" @click="switchRole('buyer')">
          <el-icon><ArrowLeft /></el-icon> 返回买方登录
        </button>

        <!-- 大标题：买方端为「登录 / 注册」双 Tab，其余角色为单标题 -->
        <div v-if="activeRole === 'buyer'" class="big-tabs">
          <span class="big-tab active">买方登录</span>
          <router-link to="/buyer/register" class="big-tab plain">买方注册</router-link>
        </div>
        <div v-else class="big-title">{{ current.title }}</div>

        <p class="card-sub">{{ current.hint }}</p>

        <!-- 表单 -->
        <el-form
          v-if="activeRole === 'buyer'"
          ref="buyerRef"
          :model="buyerForm"
          :rules="buyerRules"
          size="large"
          class="login-form"
          @submit.prevent
        >
          <el-form-item prop="username">
            <el-input v-model="buyerForm.username" prefix-icon="User" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="buyerForm.password"
              prefix-icon="Lock"
              type="password"
              show-password
              placeholder="请输入密码"
              @keyup.enter="login"
            />
          </el-form-item>
        </el-form>

        <el-form
          v-else-if="activeRole === 'farmer'"
          ref="farmerRef"
          :model="farmerForm"
          :rules="farmerRules"
          size="large"
          class="login-form"
          @submit.prevent
        >
          <el-form-item prop="phone">
            <el-input v-model="farmerForm.phone" prefix-icon="Phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item prop="idCard">
            <el-input
              v-model="farmerForm.idCard"
              prefix-icon="Postcard"
              placeholder="请输入身份证号"
              @keyup.enter="login"
            />
          </el-form-item>
        </el-form>

        <el-form
          v-else
          ref="adminRef"
          :model="adminForm"
          :rules="adminRules"
          size="large"
          class="login-form"
          @submit.prevent
        >
          <el-form-item prop="username">
            <el-input v-model="adminForm.username" prefix-icon="User" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="adminForm.password"
              prefix-icon="Lock"
              type="password"
              show-password
              placeholder="请输入密码"
              @keyup.enter="login"
            />
          </el-form-item>
        </el-form>

        <el-button class="submit" :loading="loading" @click="login">登 录</el-button>

        <!-- 演示账号 -->
        <div class="demo-line">
          <span class="demo-label">演示账号</span>
          <span class="demo-list">
            <button
              v-for="d in current.demos"
              :key="d.label"
              type="button"
              class="demo-link"
              @click="fillDemo(d)"
            >{{ d.label }}</button>
          </span>
        </div>

        <!-- 底部小字：其他角色入口 -->
        <div class="other-roles">
          <template v-for="(l, i) in otherLinks" :key="l.key">
            <span v-if="i > 0" class="sep">｜</span>
            <a v-if="l.to" class="small-link" :href="l.to">{{ l.label }}</a>
            <a v-else class="small-link" @click="switchRole(l.key)">{{ l.label }}</a>
          </template>
        </div>

        <p class="guest-line" v-if="activeRole === 'buyer'">
          <router-link to="/" class="guest-link">
            <el-icon><View /></el-icon>
            不登录，先浏览产品 →
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Sunny, ArrowLeft, View } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const roles = [
  {
    key: 'buyer',
    demos: [
      { label: '北方批发市场 buyer1', username: 'buyer1', password: '123456' },
      { label: '鲜达商超 buyer2', username: 'buyer2', password: '123456' }
    ]
  },
  {
    key: 'farmer',
    demos: [
      { label: '张三 13900000001', phone: '13900000001', idCard: '330102199001011234' },
      { label: '李四 13900000002', phone: '13900000002', idCard: '330102199203032345' }
    ]
  },
  {
    key: 'admin',
    demos: [
      { label: '系统管理员 admin', username: 'admin', password: '123456' },
      { label: '收购管理员 buyer', username: 'buyer', password: '123456' },
      { label: '销售管理员 sale', username: 'sale', password: '123456' }
    ]
  }
]

const meta = {
  buyer: { title: '买方登录', hint: '批发商 · 商超 · 电商 · 加工企业' },
  farmer: { title: '农户登录', hint: '手机号与身份证号实名认证登录' },
  admin: { title: '管理端登录', hint: '系统管理员 / 收购管理员 / 销售管理员' }
}

const activeRole = ref('buyer')

const otherLinks = computed(() => {
  const all = [
    { key: 'buyer', label: '买方登录' },
    { key: 'farmer', label: '农户登录' },
    { key: 'admin', label: '管理端登录' }
  ]
  const list = all.filter(l => l.key !== activeRole.value)
  if (activeRole.value === 'farmer') list.push({ key: 'farmer-reg', label: '农户注册', to: '#/m/register' })
  return list
})

const loading = ref(false)
const current = computed(() => ({
  ...meta[activeRole.value],
  demos: roles.find(r => r.key === activeRole.value).demos
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

onMounted(() => {
  const r = route.query.role
  if (r && ['buyer', 'farmer', 'admin'].includes(r)) activeRole.value = r
})

function switchRole(key) {
  if (activeRole.value === key) return
  activeRole.value = key
}

function fillDemo(demo) {
  if (activeRole.value === 'admin') {
    adminForm.username = demo.username
    adminForm.password = demo.password
  } else if (activeRole.value === 'farmer') {
    farmerForm.phone = demo.phone
    farmerForm.idCard = demo.idCard
  } else {
    buyerForm.username = demo.username
    buyerForm.password = demo.password
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
.login-page { min-height: 100vh; background: #fff; display: flex; flex-direction: column; }
.container { max-width: 1000px; margin: 0 auto; padding: 0 20px; }

/* 顶部栏 */
.login-header { border-bottom: 1px solid #f0f0f0; background: #fff; }
.hd-row { display: flex; align-items: center; justify-content: space-between; height: 84px; }
.brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
.brand-logo {
  width: 46px; height: 46px; border-radius: 12px;
  background: linear-gradient(135deg, #0b4632, #12694a);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(18, 105, 74, .25);
}
.brand-logo .el-icon { font-size: 24px; color: #ffd24a; }
.brand-name { font-size: 21px; font-weight: 800; color: #1f3d2b; letter-spacing: .5px; }
.brand-desc { font-size: 13px; color: #999; margin-top: 2px; }
.hd-right { font-size: 13px; color: #999; display: flex; align-items: center; gap: 6px; }
.hd-back { color: #999; text-decoration: none; font-size: 13px; }
.hd-back:hover { color: #12694a; }

/* 主体 */
.login-body { flex: 1; display: flex; justify-content: center; padding: 50px 20px 70px; }
.login-card { width: 100%; max-width: 400px; position: relative; }

.back-link {
  display: inline-flex; align-items: center; gap: 3px;
  margin-bottom: 14px; padding: 0; border: none; background: none;
  font-family: inherit; font-size: 12.5px; color: #999; cursor: pointer;
}
.back-link:hover { color: #12694a; }

/* 买方端大标题 Tab */
.big-tabs { display: flex; align-items: baseline; gap: 26px; margin-bottom: 8px; }
.big-tab { font-size: 26px; font-weight: 700; color: #333; text-decoration: none; letter-spacing: .5px; }
.big-tab.active { color: #12694a; position: relative; }
.big-tab.active::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -6px;
  height: 3px; border-radius: 2px; background: #12694a;
}
.big-tab.plain { color: #999; font-weight: 400; font-size: 22px; }
.big-tab.plain:hover { color: #12694a; }
.big-title { font-size: 26px; font-weight: 700; color: #12694a; margin-bottom: 8px; letter-spacing: .5px; }
.card-sub { font-size: 13px; color: #a0a0a0; margin: 14px 0 26px; }

.login-form :deep(.el-form-item) { margin-bottom: 16px; }
.login-form :deep(.el-input__wrapper) {
  padding: 6px 14px; border-radius: 6px;
  box-shadow: 0 0 0 1px #e0e0e0 inset; background: #fff;
  transition: box-shadow .2s;
}
.login-form :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px #bfbfbf inset; }
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #12694a inset, 0 0 0 3px rgba(18, 105, 74, .09);
}
.login-form :deep(.el-input__inner) { height: 40px; font-size: 14px; }

.submit {
  width: 100%; height: 48px; margin-top: 6px;
  font-size: 16px; font-weight: 600; letter-spacing: 6px;
  border: none; border-radius: 6px; color: #fff; background: #12694a;
  transition: background .2s, transform .1s;
}
.submit:hover { background: #0e5c40; }
.submit:active { transform: translateY(1px); }

/* 演示账号 */
.demo-line {
  display: flex; align-items: baseline; justify-content: center;
  flex-wrap: wrap; gap: 3px 10px; margin: 18px 0 0;
  font-size: 12.5px; color: #b0b0b0;
}
.demo-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px 12px; }
.demo-link {
  position: relative; padding: 0; font-family: inherit; font-size: 12.5px;
  color: #12694a; background: none; border: none; cursor: pointer; transition: color .2s;
}
.demo-link:hover { color: #0e5c40; text-decoration: underline; }
.demo-link::after {
  content: ''; position: absolute; right: -7px; top: 50%;
  width: 1px; height: 10px; transform: translateY(-50%); background: #e5e5e5;
}
.demo-link:last-child::after { display: none; }

/* 其他角色（小字） */
.other-roles {
  margin-top: 26px; padding-top: 18px; border-top: 1px solid #f2f2f2;
  text-align: center; font-size: 12px; color: #b5b5b5; line-height: 1.9;
}
.small-link { color: #999; text-decoration: none; cursor: pointer; }
.small-link:hover { color: #12694a; text-decoration: underline; }
.sep { color: #e0e0e0; margin: 0 4px; }

.guest-line { margin: 16px 0 0; text-align: center; }
.guest-link {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 7px 16px; font-size: 12.5px; color: #7a8a82;
  background: #f6f8f7; border: 1px solid #e3e9e5; border-radius: 18px;
  text-decoration: none; transition: all .2s;
}
.guest-link:hover { color: #12694a; background: #eef5f1; border-color: #12694a; }

@media (max-width: 640px) {
  .hd-row { height: 64px; }
  .brand-name { font-size: 17px; }
  .brand-desc { display: none; }
  .login-body { padding: 28px 18px 50px; }
  .big-tab { font-size: 22px; }
  .big-tab.plain { font-size: 18px; }
  .big-title { font-size: 22px; }
}
</style>
