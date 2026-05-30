var storage = require("../../utils/storage");
var gami = require("../../utils/gamification");

Page({
  data: {
    // 总体统计
    totalPractices: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    accuracy: 0,
    streakDays: 0,
    totalXP: 0,
    // 今日统计
    todayQuestions: 0,
    todayCorrect: 0,
    todayAccuracy: 0,
    // 教材统计
    bookStats: [],
    // 最近7天趋势
    weekTrend: [],
    // 错题统计
    totalReviewItems: 0,
    masteredItems: 0,
    highPriorityItems: 0
  },

  onShow: function () {
    this.loadStats();
  },

  loadStats: function () {
    var stats = storage.getUserStats();
    var gameData = gami.getGameData();
    var streakDays = gami.getStreakDays();

    // 今日统计
    var todayStr = new Date().toISOString().slice(0, 10);
    var records = storage.getPracticeRecords();
    var todayRecords = records.filter(function (r) {
      if (!r.createdAt) return false;
      var d = new Date(r.createdAt).toISOString().slice(0, 10);
      return d === todayStr;
    });
    var todayCorrect = todayRecords.filter(function (r) { return r.isCorrect; }).length;

    // 教材统计
    var books = storage.getBooks();
    var allWords = storage.getWords();
    var bookStats = books.map(function (book) {
      var bookWords = allWords.filter(function (w) { return w.bookId === book._id; });
      var bookRecords = records.filter(function (r) {
        return bookWords.some(function (w) { return w._id === r.wordId; });
      });
      var bookCorrect = bookRecords.filter(function (r) { return r.isCorrect; }).length;
      return {
        name: book.name,
        wordCount: bookWords.length,
        practiceCount: bookRecords.length,
        accuracy: bookRecords.length > 0 ? Math.round((bookCorrect / bookRecords.length) * 100) : 0
      };
    });

    // 最近7天趋势
    var weekTrend = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      var dateStr = d.toISOString().slice(0, 10);
      var dayLabel = (d.getMonth() + 1) + '/' + d.getDate();
      var dayRecords = records.filter(function (r) {
        if (!r.createdAt) return false;
        return new Date(r.createdAt).toISOString().slice(0, 10) === dateStr;
      });
      weekTrend.push({
        date: dateStr,
        label: dayLabel,
        count: dayRecords.length,
        correct: dayRecords.filter(function (r) { return r.isCorrect; }).length
      });
    }

    // 错题统计
    var reviewItems = storage.getReviewItems();
    var masteredItems = reviewItems.filter(function (r) { return r.mastered; }).length;
    var highPriorityItems = reviewItems.filter(function (r) { return r.priority === 'high' && !r.mastered; }).length;

    this.setData({
      totalPractices: stats.totalPractices || 0,
      totalQuestions: stats.totalQuestions || 0,
      totalCorrect: stats.totalCorrect || 0,
      accuracy: stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0,
      streakDays: streakDays,
      totalXP: gameData.totalXP || 0,
      todayQuestions: todayRecords.length,
      todayCorrect: todayCorrect,
      todayAccuracy: todayRecords.length > 0 ? Math.round((todayCorrect / todayRecords.length) * 100) : 0,
      bookStats: bookStats,
      weekTrend: weekTrend,
      totalReviewItems: reviewItems.length,
      masteredItems: masteredItems,
      highPriorityItems: highPriorityItems
    });
  },

  goBack: function () {
    wx.navigateBack();
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  }
});
