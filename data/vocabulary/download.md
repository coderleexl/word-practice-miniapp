# 词库下载指南

## 数据源

推荐使用 [KyleBing/english-vocabulary](https://github.com/KyleBing/english-vocabulary) 仓库的词库。

## 下载步骤

### 方法一：Git 克隆（推荐）

```bash
git clone https://github.com/KyleBing/english-vocabulary.git
cd english-vocabulary/json_original/json-sentence
```

### 方法二：手动下载

1. 访问 https://github.com/KyleBing/english-vocabulary
2. 点击 Code → Download ZIP
3. 解压后找到 `json_original/json-sentence/` 目录

## 文件列表

| 文件 | 级别 | 词汇量 |
|------|------|--------|
| MiddleSchool.json | 初中 | 3,223 词 |
| HighSchool.json | 高中 | 6,008 词 |
| CET4.json | 四级 | 7,508 词 |
| CET6.json | 六级 | 5,651 词 |
| Graduate.json | 考研 | 9,602 词 |
| TOEFL.json | 托福 | 13,477 词 |
| SAT.json | SAT | 8,887 词 |

## 转换为小程序格式

下载后运行转换脚本：

```bash
cd /mnt/d/workspace/word-practice-miniapp/data/vocabulary
node convert.js ./json-sentence ./csv "初中英语"
```

## 转换后格式

```csv
book,unit,word,phonetic,meaning,example,example_translation
初中英语,MiddleSchool,talk,/tɔːk/,v. 说话；谈话,I could hear Sarah talking.,我听到萨拉在讲话。
```

## 导入小程序

1. 打开小程序
2. 点击"导入词表"
3. 粘贴 CSV 内容
4. 确认导入
