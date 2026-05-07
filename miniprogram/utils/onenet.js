const BASE_URL = 'https://api.heclouds.com'

function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: options.url,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        'api-key': options.apiKey,
        ...options.header
      },
      data: options.data,
      success(res) {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.data.error || '请求失败'}`))
        }
      },
      fail(err) {
        reject(new Error('网络请求失败: ' + err.errMsg))
      }
    })
  })
}

function getDeviceData(deviceId, apiKey, dataStreamIds = []) {
  let url = `${BASE_URL}/devices/${deviceId}/datastreams`
  if (dataStreamIds.length > 0) {
    url += `?datastream_ids=${dataStreamIds.join(',')}`
  }

  return request({ url, apiKey }).then(result => {
    const data = result.data || []
    return {
      errno: result.errno,
      data: data.map(item => ({
        id: item.id,
        value: item.current_value,
        unit: item.unit,
        updateTime: item.update_at
      }))
    }
  })
}

function getHistoryData(deviceId, apiKey, dataStreamId, start, end, limit = 20) {
  const startTime = typeof start === 'string' ? start : start.toISOString()
  const endTime = typeof end === 'string' ? end : end.toISOString()

  const url = `${BASE_URL}/devices/${deviceId}/datapoints?datastream_id=${dataStreamId}&start=${startTime}&end=${endTime}&limit=${limit}`

  return request({ url, apiKey }).then(result => {
    const dataPoints = result.data?.datastreams?.[0]?.datapoints || []
    return {
      dataStreamId,
      points: dataPoints.map(point => ({
        value: point.value,
        time: point.at
      }))
    }
  })
}

function sendCommand(deviceId, apiKey, command) {
  const url = `${BASE_URL}/cmds?device_id=${deviceId}`
  
  return request({
    url,
    apiKey,
    method: 'POST',
    data: command
  })
}

module.exports = {
  getDeviceData,
  getHistoryData,
  sendCommand,
  BASE_URL
}