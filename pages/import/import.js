var storage = require("../../utils/storage");
var vocabLoader = require("../../utils/vocabulary-loader");

/**
 * 解析 CSV 文本为对象数组
 * 支持带引号的字段（含逗号）
 */
function parseCSV(text) {
  var lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  var headers = parseCSVLine(lines[0]);
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;
    var values = parseCSVLine(line);
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line) {
  var result = [];
  var current = "";
  var inQuotes = false;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * 标准化字段名（支持中英文表头）
 */
function normalizeFieldName(name) {
  var map = {
    "教材": "book", "教材名称": "book", "book": "book",
    "单元": "unit", "单元名称": "unit", "unit": "unit",
    "单词": "word", "英文": "word", "英文单词": "word", "word": "word",
    "音标": "phonetic", "phonetic": "phonetic",
    "释义": "meaning", "中文": "meaning", "中文释义": "meaning", "meaning": "meaning",
    "例句": "example", "英文例句": "example", "example": "example",
    "例句翻译": "example_translation", "中文例句": "example_translation", "example_translation": "example_translation",
    "难度": "difficulty", "difficulty": "difficulty",
    "标签": "tags", "tags": "tags"
  };
  return map[name.toLowerCase()] || name.toLowerCase();
}

/**
 * 将原始行转为标准单词对象
 */
function rowToWord(row, bookId, unitId) {
  var word = row.word || row.Word || "";
  var meaning = row.meaning || row.Meaning || "";
  if (!word || !meaning) return null;
  return {
    bookId: bookId,
    unitId: unitId,
    word: word,
    phonetic: row.phonetic || "",
    meaning: meaning,
    example: row.example || "",
    exampleTranslation: row.example_translation || "",
    difficulty: parseInt(row.difficulty) || 1,
    tags: row.tags ? row.tags.split(/[;、,]/).map(function (t) { return t.trim(); }) : []
  };
}

Page({
  data: {
    importMode: "paste",       // paste | sample
    pasteText: "",
    fields: [
      { name: "book", desc: "教材名称", required: false },
      { name: "unit", desc: "单元名称", required: false },
      { name: "word", desc: "英文单词", required: true },
      { name: "phonetic", desc: "音标", required: false },
      { name: "meaning", desc: "中文释义", required: true },
      { name: "example", desc: "英文例句", required: false },
      { name: "example_translation", desc: "例句翻译", required: false },
      { name: "difficulty", desc: "难度(1-3)", required: false },
      { name: "tags", desc: "标签(分号分隔)", required: false }
    ],
    // 字段映射
    showMapping: false,
    mappingRows: [],
    targetFields: [
      { name: "book", desc: "教材名称" },
      { name: "unit", desc: "单元名称" },
      { name: "word", desc: "英文单词" },
      { name: "phonetic", desc: "音标" },
      { name: "meaning", desc: "中文释义" },
      { name: "example", desc: "英文例句" },
      { name: "example_translation", desc: "例句翻译" },
      { name: "difficulty", desc: "难度" },
      { name: "tags", desc: "标签" },
      { name: "_skip", desc: "跳过此列" }
    ],
    // 预览
    previewRows: [],
    previewHeaders: [],
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    showPreview: false,
    // 导入目标
    books: [],
    selectedBookId: "",
    selectedBookName: "",
    newBookName: "",
    newUnitName: "",
    importing: false,
    // GitHub词库
    githubIndex: null,
    loading: false
  },

  onShow: function () {
    var books = storage.getBooks();
    var selectedBookId = storage.getSelectedBookId() || (books.length > 0 ? books[0]._id : "");
    var selectedBook = books.find(function (b) { return b._id === selectedBookId; });
    this.setData({
      books: books,
      selectedBookId: selectedBookId,
      selectedBookName: selectedBook ? selectedBook.name : ""
    });
  },

  switchMode: function (e) {
    this.setData({ importMode: e.currentTarget.dataset.mode, showPreview: false, previewRows: [] });
  },

  onPasteInput: function (e) {
    this.setData({ pasteText: e.detail.value });
  },

  onNewBookName: function (e) {
    this.setData({ newBookName: e.detail.value });
  },

  onNewUnitName: function (e) {
    this.setData({ newUnitName: e.detail.value });
  },

  selectBook: function (e) {
    var bookId = e.currentTarget.dataset.id;
    var book = this.data.books.find(function (b) { return b._id === bookId; });
    this.setData({
      selectedBookId: bookId,
      selectedBookName: book ? book.name : ""
    });
  },

  // ── 预览 ──
  preview: function () {
    var text = this.data.pasteText.trim();
    if (!text) {
      wx.showToast({ title: "请粘贴内容", icon: "none" });
      return;
    }

    var rows = parseCSV(text);
    if (rows.length === 0) {
      wx.showToast({ title: "未解析到数据", icon: "none" });
      return;
    }

    // 获取原始表头
    var lines = text.trim().split(/\r?\n/);
    var rawHeaders = parseCSVLine(lines[0]).map(function (h) { return h.trim(); });

    // 自动生成映射建议
    var targetFields = this.data.targetFields;
    var mappingRows = rawHeaders.map(function (header) {
      var autoTarget = normalizeFieldName(header);
      var targetIndex = targetFields.findIndex(function (f) { return f.name === autoTarget; });
      if (targetIndex < 0) targetIndex = targetFields.length - 1; // 默认跳过
      return {
        source: header,
        targetName: targetFields[targetIndex].desc,
        targetIndex: targetIndex
      };
    });

    this.setData({
      showMapping: true,
      mappingRows: mappingRows,
      _rawRows: rows,
      _rawHeaders: rawHeaders
    });
  },

  // ── 字段映射变更 ──
  onMappingChange: function (e) {
    var index = e.currentTarget.dataset.index;
    var targetIndex = parseInt(e.detail.value);
    var mappingRows = this.data.mappingRows.slice();
    mappingRows[index].targetIndex = targetIndex;
    mappingRows[index].targetName = this.data.targetFields[targetIndex].desc;
    this.setData({ mappingRows: mappingRows });
  },

  // ── 确认映射 ──
  confirmMapping: function () {
    var rawRows = this.data._rawRows;
    var rawHeaders = this.data._rawHeaders;
    var mappingRows = this.data.mappingRows;
    var targetFields = this.data.targetFields;

    // 根据映射转换数据
    var normalized = rawRows.map(function (row) {
      var newRow = {};
      for (var i = 0; i < mappingRows.length; i++) {
        var mapping = mappingRows[i];
        var targetField = targetFields[mapping.targetIndex];
        if (targetField && targetField.name !== '_skip') {
          newRow[targetField.name] = (row[rawHeaders[i]] || "").trim();
        }
      }
      return newRow;
    });

    // 统计
    var valid = 0;
    var errors = 0;
    normalized.forEach(function (row) {
      if (row.word && row.meaning) {
        valid++;
      } else {
        errors++;
      }
    });

    var headers = Object.keys(normalized[0]);

    this.setData({
      previewRows: normalized.slice(0, 20),
      previewHeaders: headers,
      totalRows: normalized.length,
      validRows: valid,
      errorRows: errors,
      showPreview: true,
      showMapping: false,
      _allRows: normalized
    });
  },

  // ── 导入 ──
  doImport: function () {
    var allRows = this.data._allRows;
    if (!allRows || allRows.length === 0) {
      wx.showToast({ title: "请先预览", icon: "none" });
      return;
    }

    var bookId = this.data.selectedBookId;
    var bookName = this.data.selectedBookName || this.data.newBookName.trim();
    var unitName = this.data.newUnitName.trim() || "默认单元";

    if (!bookName) {
      wx.showToast({ title: "请输入教材名称", icon: "none" });
      return;
    }

    // 创建或使用已有教材
    if (!bookId) {
      var book = storage.saveBook({ name: bookName });
      bookId = book._id;
    }

    // 创建单元
    var units = storage.getUnits(bookId);
    var unit = units.find(function (u) { return u.name === unitName; });
    if (!unit) {
      unit = storage.saveUnit({
        bookId: bookId,
        name: unitName,
        order: units.length + 1
      });
    }

    // 转换单词
    var words = [];
    allRows.forEach(function (row) {
      var w = rowToWord(row, bookId, unit._id);
      if (w) words.push(w);
    });

    if (words.length === 0) {
      wx.showToast({ title: "无有效单词", icon: "none" });
      return;
    }

    storage.saveWords(words);
    storage.setSelectedBookId(bookId);
    storage.setSelectedUnitId(unit._id);

    wx.showToast({
      title: "导入成功 " + words.length + " 词",
      icon: "success",
      duration: 2000
    });

    var that = this;
    setTimeout(function () {
      wx.redirectTo({ url: "/pages/index/index" });
    }, 1500);
  },

  // ── 加载示例数据 ──
  loadSampleData: function () {
    wx.showModal({
      title: "加载示例词库",
      content: "将加载商务英语、C++程序员英语、界面需求、四级英语共209个单词",
      success: function (res) {
        if (res.confirm) {
          // 商务英语
          var bizBook = storage.saveBook({ name: "商务英语" });
          var bizUnits = [
            { name: "商务会议", words: ["agenda","minutes","postpone","attendee","presentation","proposal","quarterly","chairperson"] },
            { name: "商务谈判", words: ["negotiate","agreement","contract","clause","compromise","deadline","discount","invoice"] },
            { name: "财务报表", words: ["revenue","profit","budget","expenditure","asset","liability","audit","dividend"] },
            { name: "人力资源", words: ["recruit","resume","probation","promotion","compensation","appraisal","terminate"] },
            { name: "市场营销", words: ["brand","campaign","target","launch","competitor","market share","strategy","survey"] },
            { name: "商务邮件", words: ["attachment","confidential","acknowledge","regarding","prompt","convenience"] },
            { name: "国际贸易", words: ["import","export","tariff","customs","shipment","warehouse","logistics","compliance"] }
          ];
          var bizMeanings = {
            "agenda":"n. 议程","minutes":"n. 会议记录","postpone":"v. 推迟","attendee":"n. 出席者",
            "presentation":"n. 演示","proposal":"n. 提案","quarterly":"adj. 季度的","chairperson":"n. 主席",
            "negotiate":"v. 谈判","agreement":"n. 协议","contract":"n. 合同","clause":"n. 条款",
            "compromise":"n./v. 妥协","deadline":"n. 截止日期","discount":"n. 折扣","invoice":"n. 发票",
            "revenue":"n. 收入","profit":"n. 利润","budget":"n. 预算","expenditure":"n. 支出",
            "asset":"n. 资产","liability":"n. 负债","audit":"n. 审计","dividend":"n. 股息",
            "recruit":"v. 招聘","resume":"n. 简历","probation":"n. 试用期","promotion":"n. 晋升",
            "compensation":"n. 薪酬","appraisal":"n. 评估","terminate":"v. 终止",
            "brand":"n. 品牌","campaign":"n. 活动","target":"n. 目标","launch":"v. 发布",
            "competitor":"n. 竞争对手","market share":"n. 市场份额","strategy":"n. 策略","survey":"n. 调查",
            "attachment":"n. 附件","confidential":"adj. 机密的","acknowledge":"v. 确认",
            "regarding":"prep. 关于","prompt":"adj. 迅速的","convenience":"n. 方便",
            "import":"v. 进口","export":"v. 出口","tariff":"n. 关税","customs":"n. 海关",
            "shipment":"n. 装运","warehouse":"n. 仓库","logistics":"n. 物流","compliance":"n. 合规"
          };
          loadBookData(bizBook._id, bizUnits, bizMeanings);

          // C++程序员英语
          var cppBook = storage.saveBook({ name: "C++程序员英语" });
          var cppUnits = [
            { name: "基础语法", words: ["variable","function","parameter","return","loop","condition","statement","syntax"] },
            { name: "数据类型", words: ["integer","floating point","character","boolean","array","string","pointer","reference"] },
            { name: "面向对象", words: ["class","object","constructor","destructor","inheritance","polymorphism","encapsulation","abstraction"] },
            { name: "内存管理", words: ["memory","allocate","deallocate","leak","heap","stack","segmentation fault","garbage collection"] },
            { name: "编译调试", words: ["compiler","linker","debug","breakpoint","compile","runtime","exception","warning"] },
            { name: "标准库", words: ["vector","template","iterator","algorithm","container","namespace","header file","preprocessor"] },
            { name: "设计模式", words: ["singleton","factory","observer","strategy","adapter","decorator"] },
            { name: "开发工具", words: ["repository","branch","merge","commit","pull request","dependency","build","framework"] }
          ];
          var cppMeanings = {
            "variable":"n. 变量","function":"n. 函数","parameter":"n. 参数","return":"v. 返回",
            "loop":"n. 循环","condition":"n. 条件","statement":"n. 语句","syntax":"n. 语法",
            "integer":"n. 整数","floating point":"n. 浮点数","character":"n. 字符","boolean":"n. 布尔值",
            "array":"n. 数组","string":"n. 字符串","pointer":"n. 指针","reference":"n. 引用",
            "class":"n. 类","object":"n. 对象","constructor":"n. 构造函数","destructor":"n. 析构函数",
            "inheritance":"n. 继承","polymorphism":"n. 多态","encapsulation":"n. 封装","abstraction":"n. 抽象",
            "memory":"n. 内存","allocate":"v. 分配","deallocate":"v. 释放","leak":"n. 泄漏",
            "heap":"n. 堆","stack":"n. 栈","segmentation fault":"n. 段错误","garbage collection":"n. 垃圾回收",
            "compiler":"n. 编译器","linker":"n. 链接器","debug":"v. 调试","breakpoint":"n. 断点",
            "compile":"v. 编译","runtime":"n. 运行时","exception":"n. 异常","warning":"n. 警告",
            "vector":"n. 向量","template":"n. 模板","iterator":"n. 迭代器","algorithm":"n. 算法",
            "container":"n. 容器","namespace":"n. 命名空间","header file":"n. 头文件","preprocessor":"n. 预处理器",
            "singleton":"n. 单例模式","factory":"n. 工厂模式","observer":"n. 观察者模式","strategy":"n. 策略模式",
            "adapter":"n. 适配器模式","decorator":"n. 装饰器模式",
            "repository":"n. 仓库","branch":"n. 分支","merge":"v. 合并","commit":"n./v. 提交",
            "pull request":"n. 拉取请求","dependency":"n. 依赖","build":"v./n. 构建","framework":"n. 框架"
          };
          loadBookData(cppBook._id, cppUnits, cppMeanings);

          // 界面与需求
          var prdBook = storage.saveBook({ name: "界面与需求" });
          var prdUnits = [
            { name: "学习模块", words: ["practice","review","test","exam","score","correct","wrong","progress"] },
            { name: "教材管理", words: ["textbook","unit","chapter","vocabulary","lesson","grade","semester","curriculum"] },
            { name: "单词练习", words: ["meaning","phonetic","pronunciation","spelling","definition","translation","example","sentence"] },
            { name: "题型类型", words: ["choice","blank","match","pair","option","hint","prompt","answer"] },
            { name: "游戏化系统", words: ["XP","streak","achievement","level","reward","challenge","quest","badge"] },
            { name: "错题复习", words: ["mistake","error","incorrect","accurate","master","grasp","memorize","recall"] },
            { name: "界面元素", words: ["button","menu","icon","page","card","progress bar","notification","setting"] },
            { name: "导入导出", words: ["import","export","upload","download","format","template","preview","confirm"] }
          ];
          var prdMeanings = {
            "practice":"n./v. 练习","review":"n./v. 复习","test":"n./v. 测试","exam":"n. 考试",
            "score":"n. 分数","correct":"adj. 正确的","wrong":"adj. 错误的","progress":"n. 进度",
            "textbook":"n. 教材","unit":"n. 单元","chapter":"n. 章节","vocabulary":"n. 词汇",
            "lesson":"n. 课","grade":"n. 年级","semester":"n. 学期","curriculum":"n. 课程体系",
            "meaning":"n. 意思","phonetic":"adj. 音标的","pronunciation":"n. 发音","spelling":"n. 拼写",
            "definition":"n. 定义","translation":"n. 翻译","example":"n. 例子","sentence":"n. 句子",
            "choice":"n. 选择","blank":"n. 空白","match":"v. 匹配","pair":"n. 配对",
            "option":"n. 选项","hint":"n. 提示","prompt":"n. 题目","answer":"n. 答案",
            "XP":"n. 经验值","streak":"n. 连续记录","achievement":"n. 成就","level":"n. 等级",
            "reward":"n. 奖励","challenge":"n. 挑战","quest":"n. 任务","badge":"n. 徽章",
            "mistake":"n. 错误","error":"n. 错误","incorrect":"adj. 不正确的","accurate":"adj. 准确的",
            "master":"v. 掌握","grasp":"v. 理解","memorize":"v. 记忆","recall":"v. 回忆",
            "button":"n. 按钮","menu":"n. 菜单","icon":"n. 图标","page":"n. 页面",
            "card":"n. 卡片","progress bar":"n. 进度条","notification":"n. 通知","setting":"n. 设置",
            "import":"v. 导入","export":"v. 导出","upload":"v. 上传","download":"v. 下载",
            "format":"n. 格式","template":"n. 模板","preview":"n./v. 预览","confirm":"v. 确认"
          };
          loadBookData(prdBook._id, prdUnits, prdMeanings);

          // 四级英语
          var cet4Book = storage.saveBook({ name: "四级英语" });
          var cet4Units = [
            { name: "Unit 1", words: ["abandon","ability","able","abnormal","aboard","abolish","about","above","abroad","absence"] },
            { name: "Unit 2", words: ["absolute","absorb","abstract","absurd","abundance","abuse","academic","academy","accelerate","accent"] },
            { name: "Unit 3", words: ["accept","access","accident","accompany","accomplish","according","account","accumulate","accurate","accuse"] }
          ];
          var cet4Meanings = {
            "abandon":"v. 放弃","ability":"n. 能力","able":"adj. 有能力的","abnormal":"adj. 异常的",
            "aboard":"adv. 在船上","abolish":"v. 废除","about":"prep. 关于","above":"prep. 在...上面",
            "abroad":"adv. 在国外","absence":"n. 缺席",
            "absolute":"adj. 绝对的","absorb":"v. 吸收","abstract":"adj. 抽象的","absurd":"adj. 荒谬的",
            "abundance":"n. 丰富","abuse":"v. 滥用","academic":"adj. 学术的","academy":"n. 学院",
            "accelerate":"v. 加速","accent":"n. 口音",
            "accept":"v. 接受","access":"n. 进入","accident":"n. 事故","accompany":"v. 陪伴",
            "accomplish":"v. 完成","according":"adv. 按照","account":"n. 账户","accumulate":"v. 积累",
            "accurate":"adj. 准确的","accuse":"v. 指控"
          };
          loadBookData(cet4Book._id, cet4Units, cet4Meanings);

          wx.showToast({
            title: "加载成功 209 词",
            icon: "success",
            duration: 2000
          });

          setTimeout(function () {
            wx.redirectTo({ url: "/pages/index/index" });
          }, 1500);
        }
      }
    });
  },

  // ── 获取词库索引 ──
  fetchGithubIndex: function () {
    var that = this;
    that.setData({ loading: true });

    vocabLoader.fetchIndex()
      .then(function (index) {
        that.updateIndex(index);
      })
      .catch(function (err) {
        console.error("Failed to fetch vocabulary index:", err);
        wx.showToast({ title: "获取词库列表失败", icon: "none" });
        that.setData({ loading: false });
      });
  },

  // 更新索引显示
  updateIndex: function (index) {
    var loadedBooks = wx.getStorageSync('wp_books') || [];
    var loadedBookNames = loadedBooks.map(function (b) { return b.name; });

    index.books.forEach(function (book) {
      book.loaded = loadedBookNames.indexOf(book.name) >= 0;
    });

    this.setData({
      githubIndex: index,
      loading: false
    });
  },

  // ── 加载词库 ──
  loadFromGithub: function (e) {
    var file = e.currentTarget.dataset.file;
    var name = e.currentTarget.dataset.name;
    var that = this;

    wx.showModal({
      title: "加载词库",
      content: "确定加载" + name + "？",
      success: function (res) {
        if (res.confirm) {
          that.setData({ loading: true });

          vocabLoader.loadVocabulary(file, function (progress) {
            if (progress.stage === 'fetching') {
              wx.showLoading({ title: "下载中..." });
            } else if (progress.stage === 'saving') {
              wx.showLoading({ title: "保存中..." });
            }
          })
            .then(function (result) {
              wx.hideLoading();
              wx.showToast({
                title: "加载成功 " + result.wordCount + " 词",
                icon: "success",
                duration: 2000
              });

              // 更新索引状态
              var index = that.data.githubIndex;
              if (index) {
                index.books.forEach(function (book) {
                  if (book.file === file || book.id === file) {
                    book.loaded = true;
                  }
                });
                that.setData({ githubIndex: index, loading: false });
              }
            })
            .catch(function (err) {
              wx.hideLoading();
              console.error('Failed to load vocabulary:', err);
              wx.showToast({ title: err.message || "加载失败，请检查网络", icon: "none" });
              that.setData({ loading: false });
            });
        }
      }
    });
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  }
});

// 辅助函数：加载教材数据
function loadBookData(bookId, units, meanings) {
  units.forEach(function (unitData, index) {
    var unit = storage.saveUnit({
      bookId: bookId,
      name: unitData.name,
      order: index + 1
    });

    var words = unitData.words.map(function (word) {
      return {
        bookId: bookId,
        unitId: unit._id,
        word: word,
        meaning: meanings[word] || "",
        phonetic: "",
        example: "",
        exampleTranslation: "",
        difficulty: 1,
        tags: []
      };
    });

    storage.saveWords(words);
  });
}
