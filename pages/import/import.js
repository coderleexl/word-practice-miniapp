Page({
  data: {
    fields: [
      { name: "book", desc: "教材名称" },
      { name: "unit", desc: "单元名称" },
      { name: "word", desc: "英文单词" },
      { name: "phonetic", desc: "音标" },
      { name: "meaning", desc: "中文释义" },
      { name: "example", desc: "英文例句" }
    ]
  },

  backHome() {
    wx.redirectTo({
      url: "/pages/index/index"
    });
  }
});
