const { words } = require("../../data/words");

function shuffle(items) {
  return items
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function makeQuestion(word, index) {
  const type = index % 2 === 0 ? "meaning" : "word";
  const distractors = shuffle(words.filter((item) => item.id !== word.id)).slice(0, 3);

  if (type === "meaning") {
    return {
      id: `q-${word.id}`,
      word,
      answer: word.meaning,
      typeLabel: "看英文选中文",
      prompt: word.word,
      hint: word.phonetic || word.example,
      options: shuffle([word, ...distractors]).map((item) => ({
        label: item.meaning,
        value: item.meaning
      }))
    };
  }

  return {
    id: `q-${word.id}`,
    word,
    answer: word.word,
    typeLabel: "看中文选英文",
    prompt: word.meaning,
    hint: word.exampleTranslation || word.example,
    options: shuffle([word, ...distractors]).map((item) => ({
      label: item.word,
      value: item.word
    }))
  };
}

Page({
  data: {
    questions: [],
    currentIndex: 0,
    currentQuestion: null,
    progressPercent: 0,
    selectedValue: "",
    feedback: null,
    buttonText: "提交"
  },

  onLoad() {
    const questions = words.map(makeQuestion);
    this.setData({
      questions,
      currentQuestion: questions[0],
      progressPercent: 100 / questions.length
    });
  },

  selectOption(event) {
    if (this.data.feedback) return;
    this.setData({
      selectedValue: event.currentTarget.dataset.value
    });
  },

  submitOrNext() {
    if (!this.data.feedback) {
      this.submitAnswer();
      return;
    }

    const nextIndex = this.data.currentIndex + 1;
    if (nextIndex >= this.data.questions.length) {
      this.finishPractice();
      return;
    }

    this.setData({
      currentIndex: nextIndex,
      currentQuestion: this.data.questions[nextIndex],
      progressPercent: ((nextIndex + 1) / this.data.questions.length) * 100,
      selectedValue: "",
      feedback: null,
      buttonText: "提交"
    });
  },

  submitAnswer() {
    const { selectedValue, currentQuestion } = this.data;
    if (!selectedValue) {
      wx.showToast({
        title: "先选择一个答案",
        icon: "none"
      });
      return;
    }

    const correct = selectedValue === currentQuestion.answer;
    const questions = this.data.questions.map((question, index) => {
      if (index !== this.data.currentIndex) return question;
      return {
        ...question,
        selectedValue,
        correct
      };
    });

    this.setData({
      questions,
      feedback: {
        correct,
        title: correct ? "回答正确" : "再记一次",
        detail: `${currentQuestion.word.word} = ${currentQuestion.word.meaning}`
      },
      buttonText: this.data.currentIndex === this.data.questions.length - 1 ? "查看结果" : "下一题"
    });
  },

  finishPractice() {
    const correctCount = this.data.questions.filter((item) => item.correct).length;
    const score = Math.round((correctCount / this.data.questions.length) * 100);
    getApp().globalData.latestResult = {
      score,
      correctCount,
      total: this.data.questions.length,
      wrongQuestions: this.data.questions.filter((item) => !item.correct)
    };

    wx.redirectTo({
      url: "/pages/result/result"
    });
  }
});
