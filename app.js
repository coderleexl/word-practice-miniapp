var storage = require("./utils/storage");

App({
  globalData: {
    latestResult: null,
    aiQuestions: null
  },

  onLaunch: function () {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-d8g8vsnry1a6f846b',
        traceUser: true
      });
    }

    // 首次使用时初始化示例数据
    storage.initSampleDataIfEmpty();
  }
});
