/**
 * GitHub词库加载器
 * 从GitHub仓库加载词库数据
 * 使用jsdelivr CDN加速（国内访问更快）
 */

// 仓库配置
const CONFIG = {
  owner: 'coderleexl',
  repo: 'word-vocabulary-data',
  branch: 'main',
  // jsdelivr CDN（国内快）
  baseUrl: 'https://cdn.jsdelivr.net/gh/coderleexl/word-vocabulary-data@main'
};

// 索引文件URL
const INDEX_URL = `${CONFIG.baseUrl}/index.json`;

/**
 * 获取词库索引
 * @returns {Promise} 索引数据
 */
function fetchIndex() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: INDEX_URL,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`Failed to fetch index: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 获取词库数据
 * @param {string} file - 文件名
 * @returns {Promise} 词库数据
 */
function fetchVocabulary(file) {
  const url = `${CONFIG.baseUrl}/${file}`;
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`Failed to fetch ${file}: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 加载词库到本地存储
 * @param {string} file - 文件名
 * @param {Function} onProgress - 进度回调
 * @returns {Promise} 加载结果
 */
function loadVocabulary(file, onProgress) {
  return new Promise((resolve, reject) => {
    onProgress && onProgress({ stage: 'fetching', file });

    fetchVocabulary(file)
      .then(data => {
        onProgress && onProgress({ stage: 'saving', file, wordCount: data.words.length });

        // 合并到现有数据
        const existingBooks = wx.getStorageSync('wp_books') || [];
        const existingUnits = wx.getStorageSync('wp_units') || [];
        const existingWords = wx.getStorageSync('wp_words') || [];

        // 检查是否已存在
        const bookExists = existingBooks.some(b => b._id === data.books[0]._id);
        if (bookExists) {
          resolve({ success: true, message: '词库已存在', wordCount: 0 });
          return;
        }

        // 添加新数据
        wx.setStorageSync('wp_books', [...existingBooks, ...data.books]);
        wx.setStorageSync('wp_units', [...existingUnits, ...data.units]);
        wx.setStorageSync('wp_words', [...existingWords, ...data.words]);

        resolve({
          success: true,
          message: `加载成功`,
          wordCount: data.words.length,
          bookName: data.books[0].name
        });
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * 获取已加载的词库信息
 * @returns {Object} 词库统计
 */
function getLoadedStats() {
  const books = wx.getStorageSync('wp_books') || [];
  const units = wx.getStorageSync('wp_units') || [];
  const words = wx.getStorageSync('wp_words') || [];

  return {
    bookCount: books.length,
    unitCount: units.length,
    wordCount: words.length
  };
}

module.exports = {
  fetchIndex,
  fetchVocabulary,
  loadVocabulary,
  getLoadedStats
};
