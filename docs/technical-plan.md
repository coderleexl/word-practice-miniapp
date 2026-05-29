# 技术方案

## 1. 推荐技术路线

一期建议使用微信原生小程序。

理由：

- 微信小程序能力最直接，审核和兼容风险低
- 项目核心在练习体验和数据闭环，不需要复杂跨端
- 原生小程序便于接入微信登录、云开发和文件导入

## 2. 前端

建议：

- 微信原生小程序
- TypeScript
- 小程序基础组件
- 本地缓存用于练习中断恢复

核心模块：

- 教材管理
- 词表导入
- 练习引擎
- 模拟测试
- 错题本
- 学习统计

## 3. 后端

MVP 可以二选一。

### 方案 A：微信云开发

适合快速验证：

- 云数据库存教材、单词、记录
- 云函数处理导入、生成题目、统计
- 云存储保存 CSV 或教材附件

优点：

- 启动快
- 部署简单
- 和小程序集成成本低

缺点：

- 后续复杂查询和迁移需要规划

### 方案 B：自建后端

适合后续产品化：

- Node.js/NestJS 或 Python/FastAPI
- PostgreSQL 或 MySQL
- Redis 做练习状态和缓存
- 对象存储保存教材文件

一期建议先用微信云开发，等验证后再迁移或扩展自建服务。

## 4. 练习引擎设计

练习引擎输入：

- 用户
- 教材
- 单元
- 题型
- 题量
- 错题权重

输出：

- 题目列表
- 正确答案
- 干扰项
- 解析

干扰项生成规则：

- 同单元优先
- 同难度优先
- 词性相近优先
- 避免答案明显重复

## 5. 教材导入设计

一期导入优先支持结构化 CSV。

导入流程：

1. 上传或粘贴
2. 解析字段
3. 预览前 20 行
4. 校验必填字段
5. 去重
6. 写入教材、单元、单词

必填字段：

- word
- meaning
- unit

可选字段：

- book
- phonetic
- example
- example_translation
- difficulty
- tags

## 6. 数据模型

### books

- _id
- name
- grade
- publisher
- createdBy
- createdAt
- updatedAt

### units

- _id
- bookId
- name
- order
- createdAt

### words

- _id
- bookId
- unitId
- word
- phonetic
- meaning
- example
- exampleTranslation
- difficulty
- tags
- createdAt

### practice_records

- _id
- userId
- wordId
- questionType
- isCorrect
- answer
- durationMs
- createdAt

### review_items

- _id
- userId
- wordId
- wrongCount
- nextReviewAt
- mastered
- updatedAt

## 7. 开发环境

Mac 本地需要：

- 微信开发者工具
- Node.js LTS
- Git
- VS Code 或 JetBrains IDE

## 8. 一期目录建议

```text
word-practice-miniapp/
  miniprogram/
  cloudfunctions/
  docs/
  import-samples/
  project.config.json
  package.json
```

## 9. 技术风险

- 小程序上传文件和解析 CSV 体验有限，必要时放到云函数处理
- 语音题型需要额外音频资源或 TTS 服务，一期先不做
- 教材版权需要由用户自有导入或获得授权
- 若后续要 AI 自动出题，需要增加审核和人工校对流程

