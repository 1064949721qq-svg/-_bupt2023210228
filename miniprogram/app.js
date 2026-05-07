App({
  globalData: {
    userInfo: null,
    onenetConfig: {
      productId: '',
      deviceId: '',
      apiKey: '',
      apiBase: 'https://api.heclouds.com'
    }
  },

  onLaunch() {
    console.log('小程序启动')
  }
})