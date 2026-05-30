/**
 * AI出题云函数
 * 调用小米Mimo API生成练习题
 */

const cloud = require('wx-server-sdk')
const axios = require('axios')
const config = require('./config')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// Mimo API配置
const MIMO_CONFIG = {
  baseUrl: config.MIMO_BASE_URL,
  apiKey: config.MIMO_API_KEY,
  model: config.MIMO_MODEL
}

/**
 * 调用Mimo API生成试题
 * @param {Array} words - 单词列表
 * @param {string} questionType - 题型
 * @param {number} count - 题目数量
 * @returns {Promise} 生成的试题
 */
async function generateQuestions(words, questionType, count) {
  const wordList = words.map(w => `${w.word} (${w.meaning})`).join('\n')

  const prompt = `请根据以下单词生成${count}道${questionType}练习题。

单词列表：
${wordList}

要求：
1. 每道题包含题目、选项、正确答案
2. 选项要合理，有干扰性
3. 返回JSON格式

返回格式示例：
{
  "questions": [
    {
      "prompt": "题目描述",
      "options": ["选项A", "选项B", "选项C", "选项D"],
      "answer": "正确选项"
    }
  ]
}`

  try {
    const response = await axios.post(
      `${MIMO_CONFIG.baseUrl}/chat/completions`,
      {
        model: MIMO_CONFIG.model,
        messages: [
          { role: 'system', content: '你是一个英语老师，擅长出练习题。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const content = response.data.choices[0].message.content
    // 解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('无法解析返回结果')
  } catch (error) {
    console.error('Mimo API Error:', error)
    throw error
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { words, questionType = '选择题', count = 5 } = event

  if (!words || words.length === 0) {
    return {
      success: false,
      error: '没有单词数据'
    }
  }

  try {
    const result = await generateQuestions(words, questionType, count)
    return {
      success: true,
      questions: result.questions
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || '生成失败'
    }
  }
}
