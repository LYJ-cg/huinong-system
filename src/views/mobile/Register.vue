<template>
  <div class="register-page">
    <van-nav-bar title="农户注册" left-arrow @click-left="$router.back()" />
    <van-form @submit="onSubmit" style="margin-top:10px">
      <van-cell-group inset>
        <van-field v-model="form.farmer_name" label="姓名" placeholder="请输入真实姓名" :rules="[{required:true,message:'请填写姓名'}]" />
        <van-field v-model="form.phone" label="手机号" placeholder="请输入手机号" type="digit" :rules="[{required:true,message:'请填写手机号'}]" />
        <van-field v-model="form.id_card" label="身份证号" placeholder="18位身份证号" :rules="[{required:true,message:'请填写身份证号'}]" />
        <van-field v-model="form.address" label="住址" placeholder="家庭住址" />
        <van-field v-model="form.bank_card" label="银行卡号" placeholder="收款银行卡号" />
        <van-field v-model="form.remark" label="备注" placeholder="种植品种/规模等" />
      </van-cell-group>
      <div style="margin:16px 16px 0"><van-button round block type="success" native-type="submit" :loading="loading">提交注册</van-button></div>
    </van-form>
    <p class="tip">提交后需等待收购点管理员实名认证审核通过方可登录。</p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { showSuccessToast, showFailToast } from 'vant'
import { useAuthStore } from '@/store/auth'
const router = useRouter(); const auth = useAuthStore()
const loading = ref(false)
const form = reactive({ farmer_name: '', phone: '', id_card: '', address: '', bank_card: '', remark: '' })
async function onSubmit() {
  loading.value = true
  const res = await auth.farmerRegister({ ...form })
  loading.value = false
  if (res.ok) { showSuccessToast('注册成功，请等待审核'); router.push('/m/login') }
  else showFailToast(res.msg)
}
</script>

<style scoped>
.register-page { min-height: 100vh; background: #f7f8fa; }
.tip { text-align: center; color: #969799; font-size: 12px; margin-top: 16px; padding: 0 24px; }
</style>
