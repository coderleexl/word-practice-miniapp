/**
 * 词库加载器
 * 直接从GitHub CDN加载词库（速度快）
 */

// GitHub CDN配置
const GITHUB_CONFIG = {
  baseUrl: 'https://cdn.jsdelivr.net/gh/coderleexl/word-vocabulary-data@main'
}

// 词库索引（内置，避免额外请求）
const VOCABULARY_INDEX = {
  version: '1.0.0',
  books: [
    { id: 'junior_high', name: '初中英语', wordCount: 3223, unitCount: 33, file: 'junior_high.json' },
    { id: 'senior_high', name: '高中英语', wordCount: 6008, unitCount: 61, file: 'senior_high.json' },
    { id: 'cet4', name: '四级英语', wordCount: 7508, unitCount: 76, file: 'cet4.json' },
    { id: 'cet6', name: '六级英语', wordCount: 5651, unitCount: 57, file: 'cet6.json' },
    { id: 'graduate', name: '考研英语', wordCount: 9602, unitCount: 97, file: 'graduate.json' },
    { id: 'toefl', name: '托福英语', wordCount: 13477, unitCount: 135, file: 'toefl.json' },
    { id: 'sat', name: 'SAT英语', wordCount: 8887, unitCount: 89, file: 'sat.json' }
  ]
}

/**
 * 获取词库索引（内置）
 */
function fetchIndex() {
  return Promise.resolve(VOCABULARY_INDEX)
}

/**
 * 从GitHub获取词库
 */
function fetchVocabulary(file) {
  const url = `${GITHUB_CONFIG.baseUrl}/${file}`
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error('下载失败'))
        }
      },
      fail: (err) => {
        reject(new Error('网络错误，请检查网络'))
      }
    })
  })
}

/**
 * 加载词库到本地存储
 * @param {string} file - 词库文件名
 * @param {Function} onProgress - 进度回调
 * @returns {Promise} 加载结果
 */
function loadVocabulary(file, onProgress) {
  return new Promise((resolve, reject) => {
    onProgress && onProgress({ stage: 'fetching', file })

    fetchVocabulary(file)
      .then(data => {
        onProgress && onProgress({ stage: 'saving', file, wordCount: data.words.length })

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
  fetchIndex,
  fetchVocabulary,
  loadVocabulary,
  getLoadedStats
}
