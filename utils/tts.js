/**
 * 语音朗读工具
 * 使用免费TTS服务朗读英文单词
 * 支持预加载，提升播放速度
 */

// 当前播放的音频实例
let audioInstance = null;

// 预加载缓存：word -> audio instance
const preloadCache = new Map();

// 最大缓存数量
const MAX_CACHE_SIZE = 5;

/**
 * 获取TTS音频URL
 */
function getAudioUrl(word) {
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=1`;
}

/**
 * 预加载单词音频
 * @param {string} word - 要预加载的单词
 */
function preload(word) {
  if (!word) return;
  if (preloadCache.has(word)) return;

  // 清理过多的缓存
  if (preloadCache.size >= MAX_CACHE_SIZE) {
    const firstKey = preloadCache.keys().next().value;
    const oldAudio = preloadCache.get(firstKey);
    try { oldAudio.destroy(); } catch (e) {}
    preloadCache.delete(firstKey);
  }

  const audio = wx.createInnerAudioContext();
  audio.src = getAudioUrl(word);
  preloadCache.set(word, audio);
}

/**
 * 朗读英文单词
 * @param {string} word - 要朗读的单词
 * @param {object} options - 选项
 * @param {function} options.onEnd - 朗读结束回调
 * @param {function} options.onError - 错误回调
 */
function speakEnglish(word, options = {}) {
  if (!word) return;

  // 停止之前的朗读
  stop();

  // 检查是否有预加载的音频
  let audio = preloadCache.get(word);

  if (audio) {
    // 使用预加载的音频
    preloadCache.delete(word);
    audioInstance = audio;

    audio.onEnded(() => {
      options.onEnd && options.onEnd();
      destroyAudio();
    });

    audio.onError((err) => {
      console.error('TTS Error:', err);
      options.onError && options.onError(err);
      destroyAudio();
    });

    audio.play();
  } else {
    // 没有预加载，实时加载
    audio = wx.createInnerAudioContext();
    audioInstance = audio;

    audio.src = getAudioUrl(word);

    audio.onEnded(() => {
      options.onEnd && options.onEnd();
      destroyAudio();
    });

    audio.onError((err) => {
      console.error('TTS Error:', err);
      options.onError && options.onError(err);
      destroyAudio();
    });

    audio.play();
  }
}

/**
 * 朗读中文
 * @param {string} text - 要朗读的中文文本
 */
function speakChinese(text) {
  if (!text) return;

  stop();

  const audio = wx.createInnerAudioContext();
  audioInstance = audio;

  audio.src = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;

  audio.onEnded(() => destroyAudio());
  audio.onError(() => destroyAudio());

  audio.play();
}

/**
 * 停止朗读
 */
function stop() {
  if (audioInstance) {
    try {
      audioInstance.stop();
    } catch (e) {
      // ignore
    }
    destroyAudio();
  }
}

/**
 * 销毁音频实例
 */
function destroyAudio() {
  if (audioInstance) {
    try {
      audioInstance.destroy();
    } catch (e) {
      // ignore
    }
    audioInstance = null;
  }
}

/**
 * 清理所有预加载缓存
 */
function clearCache() {
  preloadCache.forEach((audio) => {
    try { audio.destroy(); } catch (e) {}
  });
  preloadCache.clear();
}

/**
 * 检查是否正在朗读
 */
function isSpeaking() {
  return audioInstance !== null;
}

module.exports = {
  preload,
  speakEnglish,
  speakChinese,
  stop,
  clearCache,
  isSpeaking
};
