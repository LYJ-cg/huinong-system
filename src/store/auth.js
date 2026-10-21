import { defineStore } from 'pinia'
import { loginAdmin, loginFarmer, registerFarmer, loginBuyer, registerBuyer } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('hn_token') || '',
    user: JSON.parse(localStorage.getItem('hn_user') || 'null'),
    farmer: JSON.parse(localStorage.getItem('hn_farmer') || 'null'),
    buyer: JSON.parse(localStorage.getItem('hn_buyer') || 'null')
  }),
  getters: {
    isAdmin: (s) => !!s.token && !!s.user,
    isFarmer: (s) => !!s.token && !!s.farmer,
    isBuyer: (s) => !!s.token && !!s.buyer,
    role: (s) => {
      if (s.user) return s.user.role
      if (s.farmer) return 'FARMER'
      if (s.buyer) return 'BUYER'
      return null
    }
  },
  actions: {
    async adminLogin(username, password) {
      const res = await loginAdmin(username, password)
      if (res.ok) {
        this.token = res.token
        this.user = res.user
        localStorage.setItem('hn_token', res.token)
        localStorage.setItem('hn_user', JSON.stringify(res.user))
      }
      return res
    },
    async farmerLogin(phone, idCard) {
      const res = await loginFarmer(phone, idCard)
      if (res.ok) {
        this.token = res.token
        this.farmer = res.farmer
        localStorage.setItem('hn_token', res.token)
        localStorage.setItem('hn_farmer', JSON.stringify(res.farmer))
      }
      return res
    },
    async farmerRegister(payload) {
      return await registerFarmer(payload)
    },
    async buyerLogin(username, password) {
      const res = await loginBuyer(username, password)
      if (res.ok) {
        this.token = res.token
        this.buyer = res.buyer
        this.user = res.user   // 同时保留 sys_user 信息，角色判断需要
        localStorage.setItem('hn_token', res.token)
        localStorage.setItem('hn_buyer', JSON.stringify(res.buyer))
        localStorage.setItem('hn_user', JSON.stringify(res.user))
      }
      return res
    },
    async buyerRegister(payload) {
      return await registerBuyer(payload)
    },
    logout() {
      this.token = ''
      this.user = null
      this.farmer = null
      this.buyer = null
      localStorage.removeItem('hn_token')
      localStorage.removeItem('hn_user')
      localStorage.removeItem('hn_farmer')
      localStorage.removeItem('hn_buyer')
    }
  }
})
