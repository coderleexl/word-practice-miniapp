/**
 * 获取词库云函数
 * 直接返回词库索引，使用GitHub作为数据源
 */

const cloud = require('wx-server-sdk')
const axios = require('axios')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// GitHub CDN配置
const GITHUB_BASE_URL = 'https://cdn.jsdelivr.net/gh/coderleexl/word-vocabulary-data@main'

// 词库数据索引
const VOCABULARY_INDEX = {
  version: '1.0.0',
  baseUrl: GITHUB_BASE_URL,
  books: [
    { id: 'junior_high', name: '初中英语', wordCount: 3223, unitCount: 33, file: 'junior_high.json', url: `${GITHUB_BASE_URL}/junior_high.json` },
    { id: 'senior_high', name: '高中英语', wordCount: 6008, unitCount: 61, file: 'senior_high.json', url: `${GITHUB_BASE_URL}/senior_high.json` },
    { id: 'cet4', name: '四级英语', wordCount: 7508, unitCount: 76, file: 'cet4.json', url: `${GITHUB_BASE_URL}/cet4.json` },
    { id: 'cet6', name: '六级英语', wordCount: 5651, unitCount: 57, file: 'cet6.json', url: `${GITHUB_BASE_URL}/cet6.json` },
    { id: 'graduate', name: '考研英语', wordCount: 9602, unitCount: 97, file: 'graduate.json', url: `${GITHUB_BASE_URL}/graduate.json` },
    { id: 'toefl', name: '托福英语', wordCount: 13477, unitCount: 135, file: 'toefl.json', url: `${GITHUB_BASE_URL}/toefl.json` },
    { id: 'sat', name: 'SAT英语', wordCount: 8887, unitCount: 89, file: 'sat.json', url: `${GITHUB_BASE_URL}/sat.json` }
  ]
}

/**
 * 从GitHub获取词库数据
 */
async function getVocabularyFromGitHub(file) {
  const url = `${GITHUB_BASE_URL}/${file}`
  try {
    const response = await axios.get(url)
    return response.data
  } catch (err) {
    console.error('GitHub Error:', err)
    throw err
  }
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { action, file } = event

  // 获取索引
  if (action === 'index') {
    return { success: true, data: VOCABULARY_INDEX }
  }

  // 获取词库
  if (action === 'get') {
    try {
      const data = await getVocabularyFromGitHub(file)
      return { success: true, data: data }
    } catch (err) {
      return { success: false, error: err.message || '获取失败' }
    }
  }

  return { success: false, error: 'Unknown action' }
}
