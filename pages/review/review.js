var storage = require("../../utils/storage");

Page({
  data: {
    reviewItems: [],
    filterTab: "all",  // all | due | mastered
    filteredItems: [],
    emptyText: "暂无错题记录"
  },

  onShow: function () {
    this.loadItems();
  },

  loadItems: function () {
    var items = storage.getReviewItems();
    var allWords = storage.getWords();
    var now = Date.now();

    // 关联单词信息并添加复习提示
    items = items.map(function (item) {
      var word = allWords.find(function (w) { return w._id === item.wordId; });
      if (!word) return null;

      // 生成复习提示
      var reviewHint = "";
      if (item.mastered) {
        reviewHint = "已掌握";
      } else if (item.nextReviewAt <= now) {
        reviewHint = "可以复习了";
      } else {
        var hours = Math.ceil((item.nextReviewAt - now) / (60 * 60 * 1000));
        if (hours < 24) {
          reviewHint = hours + "小时后可复习";
        } else {
          var days = Math.ceil(hours / 24);
          reviewHint = days + "天后可复习";
        }
      }

      return Object.assign({}, item, { word: word, reviewHint: reviewHint });
    }).filter(function (item) {
      return item;
    });

    // 按优先级和错误次数排序
    items.sort(function (a, b) {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return b.wrongCount - a.wrongCount;
    });

    this.setData({ reviewItems: items });
    this.applyFilter();
  },

  switchTab: function (e) {
    this.setData({ filterTab: e.currentTarget.dataset.tab });
    this.applyFilter();
  },

  applyFilter: function () {
    var tab = this.data.filterTab;
    var items = this.data.reviewItems;
    var filtered;
    var emptyText;

    if (tab === "due") {
      var now = Date.now();
      filtered = items.filter(function (r) { return !r.mastered && r.nextReviewAt <= now; });
      emptyText = "暂无待复习的错题";
    } else if (tab === "high") {
      filtered = items.filter(function (r) { return !r.mastered && r.priority === 'high'; });
      emptyText = "暂无重点错题";
    } else if (tab === "mastered") {
      filtered = items.filter(function (r) { return r.mastered; });
      emptyText = "暂无已掌握的错题";
    } else {
      filtered = items.filter(function (r) { return !r.mastered; });
      emptyText = "暂无错题记录";
    }

    this.setData({ filteredItems: filtered, emptyText: emptyText });
  },

  markMastered: function (e) {
    var wordId = e.currentTarget.dataset.id;
    storage.markMastered(wordId);
    this.loadItems();
    wx.showToast({ title: "已标记掌握", icon: "success" });
  },

  startReview: function () {
    var dueItems = storage.getDueReviewItems();
    if (dueItems.length === 0) {
      wx.showToast({ title: "暂无待复习题目", icon: "none" });
      return;
    }
    wx.navigateTo({
      url: "/pages/practice/practice?mode=review"
    });
  },

  backHome: function () {
    wx.redirectTo({ url: "/pages/index/index" });
  }
});
