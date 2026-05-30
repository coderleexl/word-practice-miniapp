# 词库数据

## 已创建的词库

| 文件 | 类别 | 词汇量 | 说明 |
|------|------|--------|------|
| `business_english.csv` | 商务英语 | 60 词 | 会议、谈判、财务、人力、营销、邮件、贸易 |
| `cpp_developer.csv` | C++程序员英语 | 60 词 | 语法、数据类型、面向对象、内存管理、编译调试、标准库、设计模式、开发工具 |
| `prd_ui_words.csv` | 界面与需求 | 60 词 | 学习模块、教材管理、单词练习、题型类型、游戏化系统、错题复习、界面元素、导入导出 |
| `sample_cet4.csv` | 四级英语 | 30 词 | 示例数据 |

## 使用方法

### 方法一：直接导入（推荐）

1. 打开微信小程序
2. 点击"导入词表"
3. 选择"粘贴文本"
4. 复制 CSV 文件内容粘贴
5. 确认导入

### 方法二：批量导入

```javascript
// 在小程序控制台运行
const fs = require('fs');
const csv = fs.readFileSync('data/vocabulary/business_english.csv', 'utf8');
// 然后通过导入页面粘贴
```

## 词库来源

### 商务英语
- 商务会议常用词汇
- 商务谈判术语
- 财务报表专业词汇
- 人力资源管理词汇
- 市场营销术语
- 商务邮件常用表达
- 国际贸易词汇

### C++程序员英语
- 基础语法关键词
- 数据类型术语
- 面向对象概念
- 内存管理词汇
- 编译调试术语
- 标准库组件
- 设计模式名称
- 开发工具术语

### 界面与需求
- 学习模块相关词汇
- 教材管理术语
- 单词练习相关
- 题型类型名称
- 游戏化系统概念
- 错题复习词汇
- 界面元素名称
- 导入导出操作

## 扩展词库

### GitHub 推荐

1. **KyleBing/english-vocabulary** ⭐1620
   - 四六级、考研、托福、SAT
   - 地址: https://github.com/KyleBing/english-vocabulary

2. **kajweb/dict**
   - 英汉词典数据
   - 地址: https://github.com/kajweb/dict

3. **mahavivo/english-wordlists**
   - 各类英语词表
   - 地址: https://github.com/mahavivo/english-wordlists

### 免费 API

- Free Dictionary API: https://api.dictionaryapi.dev
- Datamuse API: https://www.datamuse.com/api/

## 自定义词库

可以按照以下格式创建自己的词库：

```csv
book,unit,word,phonetic,meaning,example,example_translation
教材名,单元名,单词,音标,释义,例句,例句翻译
```

## 注意事项

1. CSV 文件使用 UTF-8 编码
2. 含逗号的字段用双引号包裹
3. 每行一条单词记录
4. 必填字段：word, meaning
5. 可选字段：phonetic, example, example_translation
