Page({
  data: {
    dataTypes: ['温度', '湿度', '光照', 'PM2.5'],
    currentTypeIndex: 0,
    timeRanges: [
      { label: '最近1小时', hours: 1 },
      { label: '最近6小时', hours: 6 },
      { label: '最近24小时', hours: 24 },
      { label: '最近7天', hours: 168 }
    ],
    currentTimeIndex: 1,
    historyData: [],
    displayData: [],
    maxValue: '--',
    minValue: '--',
    midValue: '--',
    avgValue: '--'
  },

  onLoad() {
    this.loadMockHistory()
  },

  onTypeChange(e) {
    this.setData({ currentTypeIndex: e.detail.value })
    this.updateChart()
  },

  onTimeRangeChange(e) {
    this.setData({ currentTimeIndex: e.detail.value })
    this.loadMockHistory()
  },

  loadMockHistory() {
    const hours = this.data.timeRanges[this.data.currentTimeIndex].hours
    const pointCount = Math.min(hours * 2, 24)
    
    const now = new Date()
    const data = []
    
    const baseValues = [26, 65, 500, 45]
    const ranges = [[20, 35], [40, 90], [100, 1000], [10, 150]]
    const units = ['°C', '%', 'Lux', 'μg/m³']
    
    for (let i = pointCount - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60 * 1000)
      const typeIndex = this.data.currentTypeIndex
      const [min, max] = ranges[typeIndex]
      const value = (min + Math.random() * (max - min)).toFixed(1)
      
      data.push({
        time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
        value: `${value}${units[typeIndex]}`,
        rawValue: parseFloat(value),
        timestamp: time.getTime()
      })
    }

    this.setData({ historyData: data })
    this.updateChart()
  },

  updateChart() {
    if (this.data.historyData.length === 0) return

    const values = this.data.historyData.map(d => d.rawValue)
    const max = Math.max(...values)
    const min = Math.min(...values)
    const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)

    const colors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6c5ce7']
    const color = colors[this.data.currentTypeIndex]

    const displayData = this.data.historyData.map(item => {
      const height = ((item.rawValue - min) / (max - min || 1)) * 100
      return {
        ...item,
        height: Math.max(height, 3),
        color,
        showTooltip: false,
        timeLabel: item.time.split(':')[0] + ':00'
      }
    })

    this.setData({
      displayData,
      maxValue: max.toFixed(1),
      minValue: min.toFixed(1),
      midValue: ((max + min) / 2).toFixed(1),
      avgValue: avg
    })
  }
})