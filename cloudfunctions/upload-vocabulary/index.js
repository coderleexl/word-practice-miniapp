/**
 * 上传词库到微信云存储
 * 运行一次即可，不需要部署
 */

const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

/**
 * 上传文件到云存储
 */
async function uploadFile(filePath, cloudPath) {
  try {
    const result = await cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    })
    console.log(`Uploaded ${cloudPath}: ${result.fileID}`)
    return result.fileID
  } catch (err) {
    console.error(`Failed to upload ${cloudPath}:`, err)
    throw err
  }
}

/**
 * 主函数
 */
exports.main = async (event, context) => {
  const { action, files } = event

  if (action === 'upload') {
    // 上传文件
    const results = []
    for (const file of files) {
      const fileID = await uploadFile(file.path, file.cloudPath)
      results.push({ cloudPath: file.cloudPath, fileID })
    }
    return { success: true, files: results }
  }

  if (action === 'list') {
    // 列出已上传的文件
    try {
      const result = await cloud.getTempFileURL({
        fileList: event.fileIDs
      })
      return { success: true, files: result.fileList }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { success: false, error: 'Unknown action' }
}
