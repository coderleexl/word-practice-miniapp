Page({
  data: {
    result: {
      score: 0,
      correctCount: 0,
      total: 0
    },
    wrongQuestions: []
  },

  onLoad() {
    const result = getApp().globalData.latestResult || {
      score: 0,
      correctCount: 0,
      total: 0,
      wrongQuestions: []
    };

    this.setData({
      result,
      wrongQuestions: result.wrongQuestions || []
    });
  },

  again() {
    wx.redirectTo({
      url: "/pages/practice/practice"
    });
  },

  backHome() {
    wx.switchTab
      ? wx.reLaunch({ url: "/pages/index/index" })
      : wx.redirectTo({ url: "/pages/index/index" });
  }
});
