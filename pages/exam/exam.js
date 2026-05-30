var storage = require("../../utils/storage");
var engine = require("../../utils/practice-engine");

Page({
  data: {
    // 配置阶段
    phase: "config",  // config | testing | result
    books: [],
    selectedBookId: "",
    units: [],
    selectedUnitIds: [],
    questionCount: 10,
    // 题型比例
    questionTypes: [
      { key: "meaning", name: "看英文选中文", ratio: 2 },
      { key: "word", name: "看中文选英文", ratio: 2 },
      { key: "spelling", name: "拼写单词", ratio: 1 },
      { key: "cloze", name: "例句填空", ratio: 1 }
    ],
    // 测试阶段
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    progressPercent: 0,
    selectedValue: "",
    spellingInput: "",
    feedback: null,
    answered: false,
    // 结果
    score: 0,
    correctCount: 0,
    total: 0,
    wrongQuestions: [],
    duration: 0,
    startTime: 0
  },

  onShow: function () {
    var books = storage.getBooks();
    var selectedBookId = storage.getSelectedBookId() || (books.length > 0 ? books[0]._id : "");
    this.setData({ books: books, selectedBookId: selectedBookId });
    if (selectedBookId) {
      this.loadUnits(selectedBookId);
    }
  },

  loadUnits: function (bookId) {
    var units = storage.getUnits(bookId);
    this.setData({
      units: units,
      selectedUnitIds: units.map(function (u) { return u._id; })
    });
  },

  selectBook: function (e) {
    var bookId = e.currentTarget.dataset.id;
    this.setData({ selectedBookId: bookId });
    this.loadUnits(bookId);
  },

  toggleUnit: function (e) {
    var unitId = e.currentTarget.dataset.id;
    var ids = this.data.selectedUnitIds.slice();
    var idx = ids.indexOf(unitId);
    if (idx >= 0) {
      ids.splice(idx, 1);
    } else {
      ids.push(unitId);
    }
    this.setData({ selectedUnitIds: ids });
  },

  selectAllUnits: function () {
    this.setData({
      selectedUnitIds: this.data.units.map(function (u) { return u._id; })
    });
  },

  onCountInput: function (e) {
    var count = parseInt(e.detail.value) || 10;
    count = Math.max(1, Math.min(50, count));
    this.setData({ questionCount: count });
  },

  increaseType: function (e) {
    var key = e.currentTarget.dataset.key;
    var types = this.data.questionTypes.slice();
    var idx = types.findIndex(function (t) { return t.key === key; });
    if (idx >= 0 && types[idx].ratio < 5) {
      types[idx].ratio += 1;
      this.setData({ questionTypes: types });
    }
  },

  decreaseType: function (e) {
    var key = e.currentTarget.dataset.key;
    var types = this.data.questionTypes.slice();
    var idx = types.findIndex(function (t) { return t.key === key; });
    if (idx >= 0 && types[idx].ratio > 0) {
      types[idx].ratio -= 1;
      this.setData({ questionTypes: types });
    }
  },

  // ── 开始测试 ──
  startExam: function () {
    var bookId = this.data.selectedBookId;
    var unitIds = this.data.selectedUnitIds;
    if (!bookId || unitIds.length === 0) {
      wx.showToast({ title: "请选择教材和单元", icon: "none" });
      return;
    }

    var allWords = storage.getWords({ bookId: bookId });
    var words = allWords.filter(function (w) { return unitIds.indexOf(w.unitId) >= 0; });

    if (words.length === 0) {
      wx.showToast({ title: "所选单元无单词", icon: "none" });
      return;
    }

    var count = Math.min(this.data.questionCount, words.length);
    // 构建题型比例
    var types = {};
    this.data.questionTypes.forEach(function (t) {
      if (t.ratio > 0) types[t.key] = t.ratio;
    });
    if (Object.keys(types).length === 0) {
      types = { meaning: 1 };
    }
    var questions = engine.generatePractice(words, {
      count: count,
      types: types
    });

    this.setData({
      phase: "testing",
      questions: questions,
      currentIndex: 0,
      currentQuestion: questions[0],
      progressPercent: 100 / questions.length,
      selectedValue: "",
      spellingInput: "",
      feedback: null,
      answered: false,
      startTime: Date.now()
    });
  },

  // ── 答题 ──
  selectOption: function (e) {
    if (this.data.answered) return;
    this.setData({ selectedValue: e.currentTarget.dataset.value });
  },

  onSpellingInput: function (e) {
    this.setData({ spellingInput: e.detail.value });
  },

  submitAnswer: function () {
    var q = this.data.currentQuestion;
    var result;

    if (q.type === "spelling") {
      var input = (this.data.spellingInput || "").trim();
      if (!input) {
        wx.showToast({ title: "请输入拼写", icon: "none" });
        return;
      }
      result = engine.checkAnswer(q, input);
    } else {
      if (!this.data.selectedValue) {
        wx.showToast({ title: "先选择一个答案", icon: "none" });
        return;
      }
      result = engine.checkAnswer(q, this.data.selectedValue);
    }

    var questions = this.data.questions.slice();
    questions[this.data.currentIndex] = Object.assign({}, questions[this.data.currentIndex], {
      userAnswer: q.type === "spelling" ? this.data.spellingInput : this.data.selectedValue,
      correct: result.correct
    });

    this.setData({
      questions: questions,
      answered: true,
      feedback: {
        correct: result.correct,
        title: result.correct ? "正确" : "错误",
        detail: result.detail
      }
    });
  },

  nextQuestion: function () {
    var nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      this.finishExam();
      return;
    }
    var next = this.data.questions[nextIndex];
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: next,
      progressPercent: ((nextIndex + 1) / this.data.questions.length) * 100,
      selectedValue: "",
      spellingInput: "",
      feedback: null,
      answered: false
    });
  },

  finishExam: function () {
    var questions = this.data.questions;
    var correctCount = questions.filter(function (q) { return q.correct; }).length;
    var score = Math.round((correctCount / questions.length) * 100);
    var duration = Math.round((Date.now() - this.data.startTime) / 1000);

    // 保存考试记录
    storage.saveExamRecord({
      bookId: this.data.selectedBookId,
      unitIds: this.data.selectedUnitIds,
      questionCount: questions.length,
      score: score,
      correctCount: correctCount,
      duration: duration
    });

    // 错题加入复习
    questions.forEach(function (q) {
      if (!q.correct && q.word) {
        storage.saveReviewItem({ wordId: q.word._id });
      }
    });

    storage.updateUserStats(correctCount, questions.length);

    this.setData({
      phase: "result",
      score: score,
      correctCount: correctCount,
      total: questions.length,
      wrongQuestions: questions.filter(function (q) { return !q.correct; }),
      duration: duration
    });
  },

  again: function () {
    this.setData({ phase: "config" });
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  }
});
