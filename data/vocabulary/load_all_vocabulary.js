/**
 * 在微信开发者工具控制台运行此脚本加载所有词库
 *
 * 使用方法：
 * 1. 打开微信开发者工具
 * 2. 点击"调试器"面板
 * 3. 在Console标签页粘贴此脚本
 * 4. 按回车执行
 */

console.log('Loading all vocabulary data...');

// 读取GitHub词库数据
const githubData = require('./github_vocabulary.json');

// 合并到现有数据
const existingBooks = wx.getStorageSync('wp_books') || [];
const existingUnits = wx.getStorageSync('wp_units') || [];
const existingWords = wx.getStorageSync('wp_words') || [];

// 添加新数据
wx.setStorageSync('wp_books', [...existingBooks, ...githubData.books]);
wx.setStorageSync('wp_units', [...existingUnits, ...githubData.units]);
wx.setStorageSync('wp_words', [...existingWords, ...githubData.words]);

console.log('✅ All vocabulary loaded!');
console.log(`📚 Books: ${githubData.books.length} new`);
console.log(`📖 Units: ${githubData.units.length} new`);
console.log(`📝 Words: ${githubData.words.length} new`);
console.log(`\n📊 Total:`);
console.log(`  - Books: ${existingBooks.length + githubData.books.length}`);
console.log(`  - Units: ${existingUnits.length + githubData.units.length}`);
console.log(`  - Words: ${existingWords.length + githubData.words.length}`);
console.log('\n请刷新小程序页面查看数据');
