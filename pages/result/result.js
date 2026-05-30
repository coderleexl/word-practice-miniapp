var storage = require("../../utils/storage");

Page({
  data: {
    score: 0,
    correctCount: 0,
    total: 0,
    earnedXP: 0,
    wrongQuestions: [],
    emoji: "",
    title: "",
    showConfetti: false,
    aiLoading: false
  },

  onLoad: function () {
    var result = getApp().globalData.latestResult || {
      score: 0,
      correctCount: 0,
      total: 0,
      wrongQuestions: [],
      earnedXP: 0
    };

    var emoji, title;
    if (result.score === 100) {
      emoji = "🎉"; title = "太完美了!";
    } else if (result.score >= 80) {
      emoji = "👏"; title = "太棒了!";
    } else if (result.score >= 60) {
      emoji = "💪"; title = "继续加油!";
    } else {
      emoji = "📖"; title = "再试一次!";
    }

    this.setData({
      score: result.score,
      correctCount: result.correctCount,
      total: result.total,
      earnedXP: result.earnedXP || 0,
      wrongQuestions: result.wrongQuestions || [],
      emoji: emoji,
      title: title,
      showConfetti: result.score >= 80
    });
  },

  again: function () {
    wx.redirectTo({ url: "/pages/practice/practice" });
  },

  goReview: function () {
    wx.redirectTo({ url: "/pages/review/review" });
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  },

  // AI出题
  aiGenerate: function () {
    var that = this;
    var wrongQuestions = this.data.wrongQuestions;

    if (wrongQuestions.length === 0) {
      wx.showToast({ title: "没有错题，无法生成", icon: "none" });
      return;
    }

    that.setData({ aiLoading: true });
    wx.showLoading({ title: "AI生成中..." });

    // 提取错题单词
    var words = wrongQuestions.map(function (q) {
      return {
        word: q.word.word,
        meaning: q.word.meaning
      };
    });

    // 调用云函数
    wx.cloud.callFunction({
      name: 'ai-generate',
      data: {
        words: words,
        questionType: '选择题',
        count: 5
      },
      success: function (res) {
        wx.hideLoading();
        if (res.result.success) {
          // 保存AI生成的试题到全局数据
          getApp().globalData.aiQuestions = res.result.questions;
          wx.showToast({ title: "生成成功", icon: "success" });
          // 跳转到练习页
          setTimeout(function () {
            wx.redirectTo({ url: "/pages/practice/practice?mode=ai" });
          }, 1500);
        } else {
          wx.showToast({ title: res.result.error || "生成失败", icon: "none" });
        }
      },
      fail: function (err) {
        wx.hideLoading();
        console.error('AI Generate Error:', err);
        wx.showToast({ title: "调用失败，请检查网络", icon: "none" });
      },
      complete: function () {
        that.setData({ aiLoading: false });
      }
    });
  }
});
