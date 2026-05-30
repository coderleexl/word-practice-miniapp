var storage = require("../../utils/storage");
var engine = require("../../utils/practice-engine");
var gami = require("../../utils/gamification");
var anim = require("../../utils/animation");
var tts = require("../../utils/tts");

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    progressPercent: 0,
    // 答题状态
    selectedValue: "",
    spellingInput: "",
    answered: false,
    answerResult: null, // 'correct' | 'wrong'
    // 动效状态
    cardAnim: "anim-slide-in",
    confettiParticles: [],
    showFloatingXP: false,
    floatingXP: 0,
    shakeCard: false,
    // 配对题
    matchingPairs: {},
    matchingSelected: null,
    matchingDone: false,
    matchedCount: 0,
    // XP 累计
    roundXP: 0,
    correctCount: 0
  },

  onLoad: function (options) {
    var bookId = options.bookId || storage.getSelectedBookId();
    var unitId = options.unitId || storage.getSelectedUnitId();
    var mode = options.mode || "practice";

    var words = storage.getWords({ bookId: bookId, unitId: unitId });

    if (words.length === 0) {
      wx.showToast({ title: "词表为空", icon: "none" });
      setTimeout(function () { wx.navigateBack(); }, 1500);
      return;
    }

    var questionTypes = { meaning: 2, word: 2, spelling: 1, cloze: 1 };
    var reviewWordIds = [];

    if (mode === "review") {
      var dueItems = storage.getDueReviewItems();
      reviewWordIds = dueItems.map(function (r) { return r.wordId; });
      questionTypes = { meaning: 1, word: 1 };
    }

    var questions = engine.generatePractice(words, {
      count: Math.min(10, words.length),
      types: questionTypes,
      reviewWordIds: reviewWordIds
    });

    this.setData({
      questions: questions,
      currentQuestion: questions[0],
      progressPercent: 100 / questions.length,
      roundXP: 0,
      correctCount: 0
    });

    // 预加载第一题音频
    this.preloadCurrentAndNext();
  },

  // ── 选择题：选中后自动判题 ──
  selectOption: function (e) {
    if (this.data.answered) return;
    var value = e.currentTarget.dataset.value;
    this.setData({ selectedValue: value });
    // 自动提交
    this.submitAnswer(value);
  },

  // ── 拼写题：输入 ──
  onSpellingInput: function (e) {
    this.setData({ spellingInput: e.detail.value });
  },

  submitSpelling: function () {
    if (this.data.answered) return;
    var input = (this.data.spellingInput || "").trim();
    if (!input) {
      wx.showToast({ title: "请输入拼写", icon: "none" });
      return;
    }
    this.submitAnswer(input);
  },

  // ── 配对题：选中单词 ──
  selectMatchWord: function (e) {
    if (this.data.matchingDone) return;
    this.setData({ matchingSelected: e.currentTarget.dataset.id });
  },

  // ── 配对题：选中释义 ──
  selectMatchMeaning: function (e) {
    if (this.data.matchingDone) return;
    var wordId = this.data.matchingSelected;
    if (!wordId) {
      wx.showToast({ title: "先选一个单词", icon: "none" });
      return;
    }
    var meaningId = e.currentTarget.dataset.id;
    var pairs = Object.assign({}, this.data.matchingPairs);
    pairs[wordId] = meaningId;

    var q = this.data.currentQuestion;
    var matched = Object.keys(pairs).length;
    var total = q.pairs.length;

    this.setData({ matchingPairs: pairs, matchingSelected: null, matchedCount: Object.keys(pairs).length });

    if (matched === total) {
      var result = engine.checkAnswer(q, pairs);
      this.setData({ matchingDone: true });
      this.onAnswerResult(result.correct);
    }
  },

  // ── 统一判题 ──
  submitAnswer: function (userAnswer) {
    var q = this.data.currentQuestion;
    var result = engine.checkAnswer(q, userAnswer);
    this.onAnswerResult(result.correct);
  },

  onAnswerResult: function (isCorrect) {
    var xp = gami.addXPForAnswer(isCorrect);
    var newXp = this.data.roundXP + xp;

    this.setData({
      answered: true,
      answerResult: isCorrect ? 'correct' : 'wrong',
      roundXP: newXp,
      correctCount: this.data.correctCount + (isCorrect ? 1 : 0)
    });

    // 记录练习记录
    var q = this.data.currentQuestion;
    storage.savePracticeRecord({
      wordId: q.word ? q.word._id : null,
      questionType: q.type,
      isCorrect: isCorrect,
      answer: this.data.selectedValue || this.data.spellingInput || "",
      durationMs: 0
    });

    if (isCorrect) {
      // 撒花 + XP 飞入
      anim.fireConfettiCSS(this);
      anim.floatXP(this, xp);
      anim.vibrateLight();
    } else {
      // 震动 + 错题加入复习
      this.setData({ shakeCard: true });
      anim.vibrateError();
      if (q.word) {
        storage.saveReviewItem({ wordId: q.word._id });
      }
    }

    // 自动跳下一题
    var that = this;
    setTimeout(function () {
      that.goNext();
    }, 1200);
  },

  goNext: function () {
    var nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      this.finishPractice();
      return;
    }

    var next = this.data.questions[nextIndex];
    this.setData({
      currentIndex: nextIndex,
      currentQuestion: next,
      progressPercent: ((nextIndex + 1) / this.data.questions.length) * 100,
      selectedValue: "",
      spellingInput: "",
      answered: false,
      answerResult: null,
      shakeCard: false,
      cardAnim: "anim-slide-in",
      matchingPairs: {},
      matchingSelected: null,
      matchingDone: false,
      matchedCount: 0
    });

    // 预加载下一题音频
    this.preloadCurrentAndNext();
  },

  // ── 朗读单词 ──
  speakWord: function () {
    var q = this.data.currentQuestion;
    if (q && q.word && q.word.word) {
      tts.speakEnglish(q.word.word, {
        onError: function () {
          wx.showToast({ title: "朗读失败", icon: "none" });
        }
      });
    }
  },

  // ── 预加载当前和下一题音频 ──
  preloadCurrentAndNext: function () {
    var questions = this.data.questions;
    var currentIndex = this.data.currentIndex;

    // 预加载当前题
    var current = questions[currentIndex];
    if (current && current.word && current.word.word) {
      tts.preload(current.word.word);
    }

    // 预加载下一题
    var next = questions[currentIndex + 1];
    if (next && next.word && next.word.word) {
      tts.preload(next.word.word);
    }
  },

  finishPractice: function () {
    var total = this.data.questions.length;
    var correct = this.data.correctCount;

    // 完成奖励 XP
    var bonusXP = gami.addXPRoundComplete();
    // 打卡
    gami.recordStreak();
    // 更新每日任务
    gami.updateDailyQuest('questions', storage.getPracticeRecords().length);
    var accuracy = Math.round((correct / total) * 100);
    gami.updateDailyQuest('accuracy', accuracy);
    // 更新统计
    storage.updateUserStats(correct, total);

    var score = Math.round((correct / total) * 100);

    getApp().globalData.latestResult = {
      score: score,
      correctCount: correct,
      total: total,
      wrongQuestions: this.data.questions.filter(function (q) { return !q.correct; }),
      earnedXP: this.data.roundXP + bonusXP
    };

    wx.redirectTo({ url: "/pages/result/result" });
  }
});
