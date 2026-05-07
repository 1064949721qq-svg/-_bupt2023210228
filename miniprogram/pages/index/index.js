const onenet = require('../../utils/onenet.js')

Page({
  data: {
    isOnline: true,
    updateTime: '--:--:--',
    loading: false,
    sensorData: [
      { name: '温度', value: '--', unit: '°C', icon: '🌡️', color: '#ff6b6b', trend: 'stable', id: 'temperature' },
      { name: '湿度', value: '--', unit: '%', icon: '💧', color: '#4ecdc4', trend: 'stable', id: 'humidity' },
      { name: '光照', value: '--', unit: 'Lux', icon: '☀️', color: '#ffd93d', trend: 'stable', id: 'light' },
      { name: 'PM2.5', value: '--', unit: 'μg/m³', icon: '🌫️', color: '#6c5ce7', trend: 'stable', id: 'pm25' }
    ],
    controls: [
      { id: 'led', name: 'LED灯', status: false },
      { id: 'fan', name: '风扇', status: false },
      { id: 'pump', name: '水泵', status: false }
    ],
    timer: null,
    useMockData: true
  },

  onLoad() {
    this.refreshData()
    this.startAutoRefresh()
  },

  onUnload() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
    }
  },

  startAutoRefresh() {
    const timer = setInterval(() => {
      this.refreshData()
    }, 5000)
    this.setData({ timer })
  },

  async refreshData() {
    if (this.data.loading) return
    this.setData({ loading: true })

    try {
      if (this.data.useMockData) {
        await this.loadMockData()
      } else {
        await this.loadRealData()
      }

      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.setData({ updateTime: timeStr, isOnline: true })
    } catch (error) {
      console.error('数据获取失败:', error)
      this.setData({ isOnline: false })
      wx.showToast({ title: '获取数据失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },

  loadMockData() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockData = {
          temperature: (25 + Math.random() * 10).toFixed(1),
          humidity: (50 + Math.random() * 30).toFixed(1),
          light: Math.floor(200 + Math.random() * 800),
          pm25: Math.floor(20 + Math.random() * 80)
        }

        const sensorData = this.data.sensorData.map(item => {
          const newValue = mockData[item.id]
          const oldValue = parseFloat(item.value) || newValue
          let trend = 'stable'
          if (newValue > oldValue) trend = 'up'
          if (newValue < oldValue) trend = 'down'

          return { ...item, value: newValue, trend }
        })

        this.setData({ sensorData })
        resolve()
      }, 500)
    })
  },

  async loadRealData() {
    const app = getApp()
    const { deviceId, apiKey } = app.globalData.onenetConfig

    if (!deviceId || !apiKey) {
      throw new Error('请先配置OneNet参数')
    }

    const result = await onenet.getDeviceData(deviceId, apiKey)
    
    const sensorData = this.data.sensorData.map(item => {
      const dataPoint = result.data.find(d => d.id === item.id)
      const newValue = dataPoint ? dataPoint.value : '--'
      
      let trend = 'stable'
      if (parseFloat(newValue) > parseFloat(item.value)) trend = 'up'
      if (parseFloat(newValue) < parseFloat(item.value)) trend = 'down'

      return { ...item, value: newValue, trend }
    })

    this.setData({ sensorData })
  },

  onControlChange(e) {
    const controlId = e.currentTarget.dataset.id
    const controls = this.data.controls.map(item => {
      if (item.id === controlId) {
        return { ...item, status: e.detail.value }
      }
      return item
    })

    this.setData({ controls })

    const control = controls.find(c => c.id === controlId)
    wx.showToast({
      title: `${control.name}已${control.status ? '开启' : '关闭'}`,
      icon: 'none'
    })
  },

  showSettings() {
    wx.showModal({
      title: '提示',
      content: '请在代码中配置OneNet的productId、deviceId和apiKey后，将useMockData改为false即可连接真实设备',
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: 'IoT数据监控',
      path: '/pages/index/index'
    }
  }
})