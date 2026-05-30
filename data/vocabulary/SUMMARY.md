# 词库数据汇总

## 数据来源

### 1. GitHub大型词库 ✅

来源：[KyleBing/english-vocabulary](https://github.com/KyleBing/english-vocabulary)

| 词库 | 词汇量 | 单元数 | 文件 |
|------|--------|--------|------|
| 初中英语 | 3,223 | 33 | github_vocabulary.json |
| 高中英语 | 6,008 | 61 | github_vocabulary.json |
| 四级英语 | 7,508 | 76 | github_vocabulary.json |
| 六级英语 | 5,651 | 57 | github_vocabulary.json |
| 考研英语 | 9,602 | 97 | github_vocabulary.json |
| 托福英语 | 13,477 | 135 | github_vocabulary.json |
| SAT英语 | 8,887 | 89 | github_vocabulary.json |
| **总计** | **54,356** | **548** | |

### 2. 专业词库（手动创建） ✅

| 词库 | 词汇量 | 单元数 | 文件 |
|------|--------|--------|------|
| 商务英语 | 53 | 7 | business_english.csv |
| C++程序员英语 | 62 | 8 | cpp_developer.csv |
| 界面与需求 | 64 | 8 | prd_ui_words.csv |
| 四级英语（示例） | 30 | 3 | sample_cet4.csv |
| **总计** | **209** | **26** | |

### 3. API获取（部分完成） ⏳

- 商务英语：98词（已获取）
- C++程序员：部分获取
- 保存位置：api_vocabulary.json（未完成）

---

## 总计词汇量

| 来源 | 词汇量 |
|------|--------|
| GitHub词库 | 54,356 |
| 专业词库 | 209 |
| **总计** | **54,565** |

---

## 文件清单

### 数据文件

| 文件 | 说明 | 大小 |
|------|------|------|
| github_vocabulary.json | GitHub词库（54,356词） | ~50MB |
| vocabulary_data.json | 专业词库（209词） | ~100KB |
| business_english.csv | 商务英语 | ~10KB |
| cpp_developer.csv | C++程序员英语 | ~10KB |
| prd_ui_words.csv | 界面与需求 | ~10KB |
| sample_cet4.csv | 四级英语示例 | ~5KB |

### 加载脚本

| 文件 | 说明 |
|------|------|
| load_data_console.js | 加载专业词库（209词） |
| load_github_vocabulary.js | 加载GitHub词库（54,356词） |
| load_all_vocabulary.js | 加载所有词库 |

### 转换脚本

| 文件 | 说明 |
|------|------|
| convert.js | CSV格式转换 |
| convert_github.js | GitHub JSON格式转换 |
| import_all.js | 批量导入脚本 |
| fetch_more_words.js | API获取脚本 |

---

## 使用方法

### 方法一：加载所有词库（推荐）

1. 打开微信开发者工具
2. 点击"调试器"面板
3. 在Console标签页运行：
```javascript
// 复制 load_all_vocabulary.js 内容并粘贴
```

### 方法二：加载专业词库

1. 打开小程序
2. 点击"导入词表"
3. 点击"加载示例词库（209词）"

### 方法三：手动导入CSV

1. 打开小程序
2. 点击"导入词表"
3. 粘贴CSV文件内容
4. 确认导入

---

## 注意事项

1. **数据量大**：GitHub词库有54,000+词，加载可能需要几秒钟
2. **存储空间**：微信小程序本地存储有10MB限制，可能需要分批加载
3. **性能考虑**：大量数据可能影响小程序性能，建议按需加载
4. **数据格式**：所有数据已转换为小程序标准格式

---

## 下一步

1. 测试加载所有词库
2. 验证各功能正常
3. 优化性能（如需要）
4. 添加更多专业词库
