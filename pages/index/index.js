const { words } = require("../../data/words");

Page({
  data: {
    words,
    wordCount: words.length,
    lastScore: "--"
  },

  onShow() {
    const latestResult = getApp().globalData.latestResult;
    this.setData({
      lastScore: latestResult ? `${latestResult.score}%` : "--"
    });
  },

  startPractice() {
    wx.navigateTo({
      url: "/pages/practice/practice"
    });
  },

  goImport() {
    wx.navigateTo({
      url: "/pages/import/import"
    });
  }
});
