var storage = require("../../utils/storage");
var gami = require("../../utils/gamification");

Page({
  data: {
    // 统计
    streakDays: 0,
    totalXP: 0,
    todayCount: 0,
    // 进度环
    progressPercent: 0,
    progressDone: 0,
    progressTarget: 10,
    // 教材
    selectedBook: null,
    // 每日任务
    dailyQuests: [],
    // 复习
    dueReviewCount: 0
  },

  onShow: function () {
    this.loadData();
  },

  onReady: function () {
    this.drawRing();
  },

  drawRing: function () {
    var that = this;
    setTimeout(function () {
      var percent = that.data.progressPercent || 0;
      var ctx = wx.createCanvasContext('progressRing', that);
      var size = 160;
      var lineWidth = 14;
      var r = size / 2 - lineWidth / 2;
      var cx = size / 2;
      var cy = size / 2;

      // 背景环
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.setStrokeColor('#E5E5E5');
      ctx.setLineWidth(lineWidth);
      ctx.setLineCap('round');
      ctx.stroke();

      // 进度环
      if (percent > 0) {
        var startAngle = -Math.PI / 2;
        var endAngle = startAngle + (2 * Math.PI * percent / 100);
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.setStrokeColor('#58CC02');
        ctx.setLineWidth(lineWidth);
        ctx.setLineCap('round');
        ctx.stroke();
      }

      ctx.draw();
    }, 100);
  },

  loadData: function () {
    var books = storage.getBooks();
    var selectedBookId = storage.getSelectedBookId();
    var selectedBook = books.find(function (b) { return b._id === selectedBookId; }) || books[0] || null;

    // 游戏化数据
    var streakDays = gami.getStreakDays();
    var gameData = gami.getGameData();
    var dailyQuests = gami.getDailyQuests();
    var dueReviewCount = storage.getDueReviewItems().length;

    // 今日做题数
    var todayStr = new Date().toISOString().slice(0, 10);
    var records = storage.getPracticeRecords();
    var todayCount = records.filter(function (r) {
      if (!r.createdAt) return false;
      var d = new Date(r.createdAt).toISOString().slice(0, 10);
      return d === todayStr;
    }).length;

    var target = dailyQuests[0] ? dailyQuests[0].target : 10;
    var done = dailyQuests[0] ? dailyQuests[0].done : 0;

    this.setData({
      streakDays: streakDays,
      totalXP: gameData.totalXP || 0,
      todayCount: todayCount,
      progressPercent: Math.min(100, Math.round((done / target) * 100)),
      progressDone: done,
      progressTarget: target,
      selectedBook: selectedBook,
      dailyQuests: dailyQuests,
      dueReviewCount: dueReviewCount
    });
  },

  // ── 导航 ──
  goPractice: function () {
    wx.navigateTo({ url: "/pages/practice/practice" });
  },

  goReview: function () {
    wx.navigateTo({ url: "/pages/review/review" });
  },

  goExam: function () {
    wx.navigateTo({ url: "/pages/exam/exam" });
  },

  goBooks: function () {
    wx.navigateTo({ url: "/pages/books/books" });
  },

  goImport: function () {
    wx.navigateTo({ url: "/pages/import/import" });
  },

  goStats: function () {
    wx.navigateTo({ url: "/pages/stats/stats" });
  }
});
