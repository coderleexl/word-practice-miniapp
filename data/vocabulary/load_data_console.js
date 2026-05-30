/**
 * 在微信开发者工具控制台运行此脚本加载示例数据
 *
 * 使用方法：
 * 1. 打开微信开发者工具
 * 2. 点击"调试器"面板
 * 3. 在Console标签页粘贴此脚本
 * 4. 按回车执行
 */

// 示例数据
const vocabularyData = {
  "books": [
    {"_id":"book_business_001","name":"商务英语","createdAt":Date.now()},
    {"_id":"book_cpp_001","name":"C++程序员英语","createdAt":Date.now()},
    {"_id":"book_prd_001","name":"界面与需求","createdAt":Date.now()},
    {"_id":"book_cet4_001","name":"四级英语","createdAt":Date.now()}
  ],
  "units": [
    // 商务英语单元
    {"_id":"unit_biz_meeting","bookId":"book_business_001","name":"商务会议","order":1,"createdAt":Date.now()},
    {"_id":"unit_biz_negotiate","bookId":"book_business_001","name":"商务谈判","order":2,"createdAt":Date.now()},
    {"_id":"unit_biz_finance","bookId":"book_business_001","name":"财务报表","order":3,"createdAt":Date.now()},
    {"_id":"unit_biz_hr","bookId":"book_business_001","name":"人力资源","order":4,"createdAt":Date.now()},
    {"_id":"unit_biz_marketing","bookId":"book_business_001","name":"市场营销","order":5,"createdAt":Date.now()},
    {"_id":"unit_biz_email","bookId":"book_business_001","name":"商务邮件","order":6,"createdAt":Date.now()},
    {"_id":"unit_biz_trade","bookId":"book_business_001","name":"国际贸易","order":7,"createdAt":Date.now()},
    // C++单元
    {"_id":"unit_cpp_basic","bookId":"book_cpp_001","name":"基础语法","order":1,"createdAt":Date.now()},
    {"_id":"unit_cpp_types","bookId":"book_cpp_001","name":"数据类型","order":2,"createdAt":Date.now()},
    {"_id":"unit_cpp_oop","bookId":"book_cpp_001","name":"面向对象","order":3,"createdAt":Date.now()},
    {"_id":"unit_cpp_memory","bookId":"book_cpp_001","name":"内存管理","order":4,"createdAt":Date.now()},
    {"_id":"unit_cpp_debug","bookId":"book_cpp_001","name":"编译调试","order":5,"createdAt":Date.now()},
    {"_id":"unit_cpp_stl","bookId":"book_cpp_001","name":"标准库","order":6,"createdAt":Date.now()},
    {"_id":"unit_cpp_pattern","bookId":"book_cpp_001","name":"设计模式","order":7,"createdAt":Date.now()},
    {"_id":"unit_cpp_tools","bookId":"book_cpp_001","name":"开发工具","order":8,"createdAt":Date.now()},
    // 界面需求单元
    {"_id":"unit_prd_learn","bookId":"book_prd_001","name":"学习模块","order":1,"createdAt":Date.now()},
    {"_id":"unit_prd_book","bookId":"book_prd_001","name":"教材管理","order":2,"createdAt":Date.now()},
    {"_id":"unit_prd_practice","bookId":"book_prd_001","name":"单词练习","order":3,"createdAt":Date.now()},
    {"_id":"unit_prd_question","bookId":"book_prd_001","name":"题型类型","order":4,"createdAt":Date.now()},
    {"_id":"unit_prd_game","bookId":"book_prd_001","name":"游戏化系统","order":5,"createdAt":Date.now()},
    {"_id":"unit_prd_review","bookId":"book_prd_001","name":"错题复习","order":6,"createdAt":Date.now()},
    {"_id":"unit_prd_ui","bookId":"book_prd_001","name":"界面元素","order":7,"createdAt":Date.now()},
    {"_id":"unit_prd_import","bookId":"book_prd_001","name":"导入导出","order":8,"createdAt":Date.now()},
    // 四级英语单元
    {"_id":"unit_cet4_1","bookId":"book_cet4_001","name":"Unit 1","order":1,"createdAt":Date.now()},
    {"_id":"unit_cet4_2","bookId":"book_cet4_001","name":"Unit 2","order":2,"createdAt":Date.now()},
    {"_id":"unit_cet4_3","bookId":"book_cet4_001","name":"Unit 3","order":3,"createdAt":Date.now()}
  ],
  "words": [
    // 商务会议
    {"_id":"w_agenda","bookId":"book_business_001","unitId":"unit_biz_meeting","word":"agenda","phonetic":"/əˈdʒendə/","meaning":"n. 议程；日程安排","example":"Let's review the agenda for today's meeting.","exampleTranslation":"让我们回顾一下今天会议的议程。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_minutes","bookId":"book_business_001","unitId":"unit_biz_meeting","word":"minutes","phonetic":"/ˈmɪnɪts/","meaning":"n. 会议记录","example":"Please take minutes during the meeting.","exampleTranslation":"请在会议期间做记录。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_postpone","bookId":"book_business_001","unitId":"unit_biz_meeting","word":"postpone","phonetic":"/poʊstˈpoʊn/","meaning":"v. 推迟；延期","example":"We need to postpone the meeting.","exampleTranslation":"我们需要推迟会议。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_attendee","bookId":"book_business_001","unitId":"unit_biz_meeting","word":"attendee","phonetic":"/əˌtenˈdiː/","meaning":"n. 出席者；参加者","example":"All attendees must sign in.","exampleTranslation":"所有出席者必须签到。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_presentation","bookId":"book_business_001","unitId":"unit_biz_meeting","word":"presentation","phonetic":"/ˌprezenˈteɪʃn/","meaning":"n. 演示；陈述","example":"She gave an excellent presentation.","exampleTranslation":"她做了一个精彩的演示。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // 商务谈判
    {"_id":"w_negotiate","bookId":"book_business_001","unitId":"unit_biz_negotiate","word":"negotiate","phonetic":"/nɪˈɡoʊʃieɪt/","meaning":"v. 谈判；协商","example":"They negotiated the contract terms.","exampleTranslation":"他们协商了合同条款。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_agreement","bookId":"book_business_001","unitId":"unit_biz_negotiate","word":"agreement","phonetic":"/əˈɡriːmənt/","meaning":"n. 协议；一致","example":"We reached an agreement on the price.","exampleTranslation":"我们就价格达成了一致。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_contract","bookId":"book_business_001","unitId":"unit_biz_negotiate","word":"contract","phonetic":"/ˈkɑːntrækt/","meaning":"n. 合同；契约","example":"Please sign the contract.","exampleTranslation":"请签署合同。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_deadline","bookId":"book_business_001","unitId":"unit_biz_negotiate","word":"deadline","phonetic":"/ˈdedlaɪn/","meaning":"n. 截止日期","example":"The deadline is next Friday.","exampleTranslation":"截止日期是下周五。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_invoice","bookId":"book_business_001","unitId":"unit_biz_negotiate","word":"invoice","phonetic":"/ˈɪnvɔɪs/","meaning":"n. 发票","example":"Please send us the invoice.","exampleTranslation":"请把发票发给我们。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // 财务报表
    {"_id":"w_revenue","bookId":"book_business_001","unitId":"unit_biz_finance","word":"revenue","phonetic":"/ˈrevənuː/","meaning":"n. 收入；营收","example":"Annual revenue increased by 15%.","exampleTranslation":"年收入增长了15%。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_profit","bookId":"book_business_001","unitId":"unit_biz_finance","word":"profit","phonetic":"/ˈprɑːfɪt/","meaning":"n. 利润","example":"Net profit after tax was $5 million.","exampleTranslation":"税后净利润为500万美元。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_budget","bookId":"book_business_001","unitId":"unit_biz_finance","word":"budget","phonetic":"/ˈbʌdʒɪt/","meaning":"n. 预算","example":"We need to cut the budget.","exampleTranslation":"我们需要削减预算。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // C++基础语法
    {"_id":"w_variable","bookId":"book_cpp_001","unitId":"unit_cpp_basic","word":"variable","phonetic":"/ˈveriəbl/","meaning":"n. 变量","example":"Declare a variable before using it.","exampleTranslation":"使用变量前要先声明。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_function","bookId":"book_cpp_001","unitId":"unit_cpp_basic","word":"function","phonetic":"/ˈfʌŋkʃn/","meaning":"n. 函数","example":"Define a function to calculate the sum.","exampleTranslation":"定义一个函数来计算总和。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_loop","bookId":"book_cpp_001","unitId":"unit_cpp_basic","word":"loop","phonetic":"/luːp/","meaning":"n. 循环","example":"Use a loop to iterate through the array.","exampleTranslation":"使用循环遍历数组。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_pointer","bookId":"book_cpp_001","unitId":"unit_cpp_basic","word":"pointer","phonetic":"/ˈpɔɪntər/","meaning":"n. 指针","example":"A pointer stores a memory address.","exampleTranslation":"指针存储内存地址。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // C++面向对象
    {"_id":"w_class","bookId":"book_cpp_001","unitId":"unit_cpp_oop","word":"class","phonetic":"/klæs/","meaning":"n. 类","example":"Define a class for the user object.","exampleTranslation":"为用户对象定义一个类。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_inheritance","bookId":"book_cpp_001","unitId":"unit_cpp_oop","word":"inheritance","phonetic":"/ɪnˈherɪtəns/","meaning":"n. 继承","example":"Inheritance allows code reuse.","exampleTranslation":"继承允许代码重用。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_polymorphism","bookId":"book_cpp_001","unitId":"unit_cpp_oop","word":"polymorphism","phonetic":"/ˌpɑːliˈmɔːrfɪzəm/","meaning":"n. 多态","example":"Polymorphism enables flexible code.","exampleTranslation":"多态使代码更灵活。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // 界面需求-学习模块
    {"_id":"w_practice","bookId":"book_prd_001","unitId":"unit_prd_learn","word":"practice","phonetic":"/ˈpræktɪs/","meaning":"n./v. 练习","example":"Daily practice is important.","exampleTranslation":"每日练习很重要。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_review","bookId":"book_prd_001","unitId":"unit_prd_learn","word":"review","phonetic":"/rɪˈvjuː/","meaning":"n./v. 复习","example":"Review the lesson after class.","exampleTranslation":"课后复习课程。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_test","bookId":"book_prd_001","unitId":"unit_prd_learn","word":"test","phonetic":"/test/","meaning":"n./v. 测试","example":"Take a test to check your level.","exampleTranslation":"参加测试检查你的水平。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_score","bookId":"book_prd_001","unitId":"unit_prd_learn","word":"score","phonetic":"/skɔːr/","meaning":"n. 分数","example":"What's your score?","exampleTranslation":"你的分数是多少？","difficulty":1,"tags":[],"createdAt":Date.now()},
    // 界面需求-游戏化
    {"_id":"w_xp","bookId":"book_prd_001","unitId":"unit_prd_game","word":"XP","phonetic":"/eks piː/","meaning":"n. 经验值","example":"You earned 10 XP.","exampleTranslation":"你获得了10点经验值。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_streak","bookId":"book_prd_001","unitId":"unit_prd_game","word":"streak","phonetic":"/striːk/","meaning":"n. 连续记录","example":"Keep your daily streak going!","exampleTranslation":"保持你的每日连续记录！","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_achievement","bookId":"book_prd_001","unitId":"unit_prd_game","word":"achievement","phonetic":"/əˈtʃiːvmənt/","meaning":"n. 成就","example":"Unlock a new achievement.","exampleTranslation":"解锁一个新成就。","difficulty":1,"tags":[],"createdAt":Date.now()},
    // 四级英语
    {"_id":"w_abandon","bookId":"book_cet4_001","unitId":"unit_cet4_1","word":"abandon","phonetic":"/əˈbændən/","meaning":"v. 放弃；抛弃","example":"He abandoned his wife and children.","exampleTranslation":"他抛弃了妻子和孩子。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_ability","bookId":"book_cet4_001","unitId":"unit_cet4_1","word":"ability","phonetic":"/əˈbɪləti/","meaning":"n. 能力；才能","example":"She has the ability to solve problems.","exampleTranslation":"她有解决问题的能力。","difficulty":1,"tags":[],"createdAt":Date.now()},
    {"_id":"w_able","bookId":"book_cet4_001","unitId":"unit_cet4_1","word":"able","phonetic":"/ˈeɪbl/","meaning":"adj. 有能力的；能干的","example":"She is able to speak three languages.","exampleTranslation":"她能说三种语言。","difficulty":1,"tags":[],"createdAt":Date.now()}
  ]
};

// 加载数据
console.log('Loading vocabulary data...');

try {
  wx.setStorageSync('wp_books', vocabularyData.books);
  wx.setStorageSync('wp_units', vocabularyData.units);
  wx.setStorageSync('wp_words', vocabularyData.words);

  console.log('✅ Data loaded successfully!');
  console.log(`📚 Books: ${vocabularyData.books.length}`);
  console.log(`📖 Units: ${vocabularyData.units.length}`);
  console.log(`📝 Words: ${vocabularyData.words.length}`);
  console.log('\n请刷新小程序页面查看数据');
} catch (e) {
  console.error('❌ Error loading data:', e);
}
