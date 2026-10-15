import { defineStore } from 'pinia'
import { loginAdmin, loginFarmer, registerFarmer } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('hn_token') || '',
    user: JSON.parse(localStorage.getItem('hn_user') || 'null'),
    farmer: JSON.parse(localStorage.getItem('hn_farmer') || 'null')
  }),
  getters: {
    isAdmin: (s) => !!s.token && !!s.user,
    isFarmer: (s) => !!s.token && !!s.farmer
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
    logout() {
      this.token = ''
      this.user = null
      this.farmer = null
      localStorage.removeItem('hn_token')
      localStorage.removeItem('hn_user')
      localStorage.removeItem('hn_farmer')
    }
  }
})
