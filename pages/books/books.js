var storage = require("../../utils/storage");
var tts = require("../../utils/tts");

Page({
  data: {
    books: [],
    currentBook: null,
    units: [],
    words: [],
    // 新建教材
    showAddBook: false,
    newBookName: "",
    // 新建单元
    showAddUnit: false,
    newUnitName: "",
    // 新建单词
    showAddWord: false,
    newWord: { word: "", meaning: "", phonetic: "", example: "", exampleTranslation: "" },
    // 视图: list | units | words
    view: "list"
  },

  onShow: function () {
    this.loadBooks();
  },

  loadBooks: function () {
    var books = storage.getBooks();
    this.setData({ books: books, view: "list", currentBook: null });
  },

  // ── 教材操作 ──
  toggleAddBook: function () {
    this.setData({ showAddBook: !this.data.showAddBook, newBookName: "" });
  },

  onNewBookName: function (e) {
    this.setData({ newBookName: e.detail.value });
  },

  addBook: function () {
    var name = this.data.newBookName.trim();
    if (!name) {
      wx.showToast({ title: "请输入名称", icon: "none" });
      return;
    }
    storage.saveBook({ name: name });
    this.setData({ showAddBook: false, newBookName: "" });
    this.loadBooks();
    wx.showToast({ title: "已创建", icon: "success" });
  },

  selectBook: function (e) {
    var bookId = e.currentTarget.dataset.id;
    var book = this.data.books.find(function (b) { return b._id === bookId; });
    if (!book) return;
    var units = storage.getUnits(bookId);
    var words = storage.getWords({ bookId: bookId });
    // 统计每个单元的单词数
    units.forEach(function (u) {
      u.wordCount = words.filter(function (w) { return w.unitId === u._id; }).length;
    });
    this.setData({
      currentBook: book,
      units: units,
      words: words,
      view: "units"
    });
  },

  deleteBook: function (e) {
    var bookId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: "删除教材",
      content: "将删除该教材及其所有单元和单词，确定？",
      success: function (res) {
        if (res.confirm) {
          storage.deleteBook(bookId);
          that.loadBooks();
          wx.showToast({ title: "已删除", icon: "success" });
        }
      }
    });
  },

  // ── 单元操作 ──
  toggleAddUnit: function () {
    this.setData({ showAddUnit: !this.data.showAddUnit, newUnitName: "" });
  },

  onNewUnitName: function (e) {
    this.setData({ newUnitName: e.detail.value });
  },

  addUnit: function () {
    var name = this.data.newUnitName.trim();
    if (!name) {
      wx.showToast({ title: "请输入名称", icon: "none" });
      return;
    }
    var bookId = this.data.currentBook._id;
    var existingUnits = storage.getUnits(bookId);
    storage.saveUnit({
      bookId: bookId,
      name: name,
      order: existingUnits.length + 1
    });
    // 刷新
    this.selectBook({ currentTarget: { dataset: { id: bookId } } });
    this.setData({ showAddUnit: false, newUnitName: "" });
    wx.showToast({ title: "已创建", icon: "success" });
  },

  selectUnit: function (e) {
    var unitId = e.currentTarget.dataset.id;
    var unit = this.data.units.find(function (u) { return u._id === unitId; });
    if (!unit) return;
    var unitWords = this.data.words.filter(function (w) { return w.unitId === unitId; });
    this.setData({
      currentUnit: unit,
      words: unitWords,
      view: "words"
    });
  },

  deleteUnit: function (e) {
    var unitId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: "删除单元",
      content: "将删除该单元及其所有单词，确定？",
      success: function (res) {
        if (res.confirm) {
          storage.deleteUnit(unitId);
          that.selectBook({ currentTarget: { dataset: { id: that.data.currentBook._id } } });
          wx.showToast({ title: "已删除", icon: "success" });
        }
      }
    });
  },

  // ── 单词操作 ──
  toggleAddWord: function () {
    this.setData({
      showAddWord: !this.data.showAddWord,
      newWord: { word: "", meaning: "", phonetic: "", example: "", exampleTranslation: "" }
    });
  },

  onNewWordInput: function (e) {
    var field = e.currentTarget.dataset.field;
    var newWord = Object.assign({}, this.data.newWord);
    newWord[field] = e.detail.value;
    this.setData({ newWord: newWord });
  },

  addWord: function () {
    var w = this.data.newWord;
    if (!w.word.trim() || !w.meaning.trim()) {
      wx.showToast({ title: "请输入单词和释义", icon: "none" });
      return;
    }
    storage.saveWord({
      bookId: this.data.currentBook._id,
      unitId: this.data.currentUnit._id,
      word: w.word.trim(),
      meaning: w.meaning.trim(),
      phonetic: w.phonetic.trim(),
      example: w.example.trim(),
      exampleTranslation: w.exampleTranslation.trim(),
      difficulty: 1,
      tags: []
    });
    // 刷新列表
    var unitWords = storage.getWords({ bookId: this.data.currentBook._id, unitId: this.data.currentUnit._id });
    this.setData({
      words: unitWords,
      showAddWord: false,
      newWord: { word: "", meaning: "", phonetic: "", example: "", exampleTranslation: "" }
    });
    wx.showToast({ title: "已添加", icon: "success" });
  },

  deleteWord: function (e) {
    var wordId = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: "删除单词",
      content: "确定删除该单词？",
      success: function (res) {
        if (res.confirm) {
          storage.deleteWords({ wordId: wordId });
          var unitWords = storage.getWords({ bookId: that.data.currentBook._id, unitId: that.data.currentUnit._id });
          that.setData({ words: unitWords });
          wx.showToast({ title: "已删除", icon: "success" });
        }
      }
    });
  },

  // ── 朗读单词 ──
  speakWord: function (e) {
    var word = e.currentTarget.dataset.word;
    if (word) {
      tts.speakEnglish(word, {
        onError: function () {
          wx.showToast({ title: "朗读失败", icon: "none" });
        }
      });
    }
  },

  // ── 开始练习 ──
  startPracticeUnit: function (e) {
    var unitId = e.currentTarget.dataset.id;
    storage.setSelectedBookId(this.data.currentBook._id);
    storage.setSelectedUnitId(unitId);
    wx.navigateTo({
      url: "/pages/practice/practice?bookId=" + this.data.currentBook._id + "&unitId=" + unitId
    });
  },

  startPracticeBook: function () {
    storage.setSelectedBookId(this.data.currentBook._id);
    wx.navigateTo({
      url: "/pages/practice/practice?bookId=" + this.data.currentBook._id
    });
  },

  // ── 导航 ──
  goBack: function () {
    if (this.data.view === "words") {
      this.selectBook({ currentTarget: { dataset: { id: this.data.currentBook._id } } });
    } else if (this.data.view === "units") {
      this.loadBooks();
    } else {
      wx.navigateBack();
    }
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  }
});
