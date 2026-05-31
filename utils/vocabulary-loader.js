/**
 * 词库加载器
 * 直接从GitHub CDN加载词库（速度快）
 */

// GitHub CDN配置
const GITHUB_CONFIG = {
  baseUrl: 'https://cdn.jsdelivr.net/gh/coderleexl/word-vocabulary-data@main'
}

const CLOUD_FUNCTION_NAME = 'get-vocabulary'

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
 * 小程序端优先走云函数，避免前端 request 合法域名限制。
 */
function callVocabularyCloud(action, file) {
  if (typeof wx === 'undefined' || !wx.cloud || !wx.cloud.callFunction) {
    return Promise.reject(new Error('云函数不可用'))
  }

  return wx.cloud.callFunction({
    name: CLOUD_FUNCTION_NAME,
    data: { action: action, file: file }
  }).then(res => {
    const result = res.result || {}
    if (result.success) {
      return result.data
    }
    throw new Error(result.error || '云函数返回失败')
  })
}

function cloneIndex(index) {
  return {
    ...index,
    books: (index.books || []).map(book => ({ ...book }))
  }
}

function validateVocabularyData(data) {
  if (!data || !Array.isArray(data.books) || !Array.isArray(data.units) || !Array.isArray(data.words)) {
    throw new Error('词库数据格式错误')
  }
}

/**
 * 获取词库索引
 */
function fetchIndex() {
  return callVocabularyCloud('index')
    .then(index => cloneIndex(index))
    .catch(err => {
      console.warn('Fetch index from cloud failed, using builtin index:', err)
      return cloneIndex(VOCABULARY_INDEX)
    })
}

/**
 * 从GitHub获取词库
 */
function fetchVocabularyFromCdn(file) {
  const url = `${GITHUB_CONFIG.baseUrl}/${file}`
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error('下载失败：' + res.statusCode))
        }
      },
      fail: (err) => {
        reject(new Error('网络错误，请检查网络'))
      }
    })
  })
}

function fetchVocabulary(file) {
  return callVocabularyCloud('get', file)
    .catch(err => {
      console.warn('Fetch vocabulary from cloud failed, falling back to CDN:', err)
      return fetchVocabularyFromCdn(file)
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
        validateVocabularyData(data)
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
        try {
          wx.setStorageSync('wp_books', [...existingBooks, ...data.books])
          wx.setStorageSync('wp_units', [...existingUnits, ...data.units])
          wx.setStorageSync('wp_words', [...existingWords, ...data.words])
        } catch (err) {
          throw new Error('本地缓存空间不足，词库过大')
        }

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
