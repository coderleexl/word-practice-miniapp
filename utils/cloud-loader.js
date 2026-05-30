/**
 * 云存储词库加载器
 * 从微信云存储加载词库数据
 */

// 云存储文件ID配置
// 上传后需要更新这些ID
const CLOUD_FILES = {
  index: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/index.json',
  junior_high: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/junior_high.json',
  senior_high: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/senior_high.json',
  cet4: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/cet4.json',
  cet6: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/cet6.json',
  graduate: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/graduate.json',
  toefl: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/toefl.json',
  sat: 'cloud://prod-xxx.7072-prod-xxx/vocabulary/sat.json'
}

/**
 * 获取词库索引
 * @returns {Promise} 索引数据
 */
function fetchIndex() {
  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [CLOUD_FILES.index],
      success: (res) => {
        if (res.fileList[0].status === 0) {
          wx.request({
            url: res.fileList[0].tempFileURL,
            success: (res2) => {
              if (res2.statusCode === 200) {
                resolve(res2.data)
              } else {
                reject(new Error('Failed to fetch index'))
              }
            },
            fail: reject
          })
        } else {
          reject(new Error('Failed to get file URL'))
        }
      },
      fail: reject
    })
  })
}

/**
 * 获取词库数据
 * @param {string} fileKey - 文件key
 * @returns {Promise} 词库数据
 */
function fetchVocabulary(fileKey) {
  const fileID = CLOUD_FILES[fileKey]
  if (!fileID) {
    return Promise.reject(new Error('Unknown file: ' + fileKey))
  }

  return new Promise((resolve, reject) => {
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: (res) => {
        if (res.fileList[0].status === 0) {
          wx.request({
            url: res.fileList[0].tempFileURL,
            success: (res2) => {
              if (res2.statusCode === 200) {
                resolve(res2.data)
              } else {
                reject(new Error('Failed to fetch vocabulary'))
              }
            },
            fail: reject
          })
        } else {
          reject(new Error('Failed to get file URL'))
        }
      },
      fail: reject
    })
  })
}

/**
 * 加载词库到本地存储
 * @param {string} fileKey - 文件key
 * @param {Function} onProgress - 进度回调
 * @returns {Promise} 加载结果
 */
function loadVocabulary(fileKey, onProgress) {
  return new Promise((resolve, reject) => {
    onProgress && onProgress({ stage: 'fetching', file: fileKey })

    fetchVocabulary(fileKey)
      .then(data => {
        onProgress && onProgress({ stage: 'saving', file: fileKey, wordCount: data.words.length })

        // 合并到现有数据
        const existingBooks = wx.getStorageSync('wp_books') || []
        const existingUnits = wx.getStorageSync('wp_units') || []
        const existingWords = wx.getStorageSync('wp_words') || []

        // 检查是否已存在
        const bookExists = existingBooks.some(b => b._id === data.books[0]._id)
        if (bookExists) {
          resolve({ success: true, message: '词库已存在', wordCount: 0 })
          return
        }

        // 添加新数据
        wx.setStorageSync('wp_books', [...existingBooks, ...data.books])
        wx.setStorageSync('wp_units', [...existingUnits, ...data.units])
        wx.setStorageSync('wp_words', [...existingWords, ...data.words])

        resolve({
          success: true,
          message: '加载成功',
          wordCount: data.words.length,
          bookName: data.books[0].name
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

/**
 * 获取已加载的词库信息
 * @returns {Object} 词库统计
 */
function getLoadedStats() {
  const books = wx.getStorageSync('wp_books') || []
  const units = wx.getStorageSync('wp_units') || []
  const words = wx.getStorageSync('wp_words') || []

  return {
    bookCount: books.length,
    unitCount: units.length,
    wordCount: words.length
  }
}

module.exports = {
  CLOUD_FILES,
  fetchIndex,
  fetchVocabulary,
  loadVocabulary,
  getLoadedStats
}
