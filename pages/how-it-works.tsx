import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FAQItem {
  question: string;
  answer: string;
}

const HowItWorks: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: '平台如何保证信息真实性？',
      answer:
        '我们采用多重验证机制：要求用户提供身份证明、学生证或工作证明；房源信息需提供实地照片和产权证明；定期进行房源信息更新和核实；对违规信息进行严格处罚。',
    },
    {
      question: '押金如何托管？何时退还？',
      answer:
        '押金由平台第三方支付系统托管，租约到期且无纠纷时自动解冻退还。如有纠纷，平台将介入调解，确保双方权益。',
    },
    {
      question: '求租人如何预约看房？',
      answer:
        '在房源详情页点击"预约看房"，选择合适时间，等待房东确认。确认后可获得具体地址和联系方式。',
    },
    {
      question: '转租人如何下架房源？',
      answer:
        '登录后台管理系统，在"我的房源"中选择相应房源，点击"下架"即可。如已有在谈租客，建议提前沟通。',
    },
    {
      question: '如果租客违约怎么办？',
      answer:
        '平台提供标准租约模板，明确双方权责。如遇违约，可提交相关证据，平台将介入调解，必要时可申请法律援助。',
    },
    {
      question: '平台收费标准是什么？',
      answer:
        '基础房源发布免费。成功租赁后收取成交金额的3%作为服务费。额外推广服务另收费，具体见收费说明。',
    },
    {
      question: '如何修改已发布的房源信息？',
      answer: '登录后台，在"我的房源"中选择需要修改的房源，点击"编辑"进行修改。修改后需重新审核。',
    },
    {
      question: '平台提供哪些安全保障？',
      answer:
        '身份认证、押金托管、租约公证、纠纷调解、保险服务等全方位保障措施。详见平台安全保障协议。',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Banner Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">How SubletMatcher Works</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            简单三步，轻松完成转租配对。我们致力于为您提供安全、便捷、透明的房屋转租服务。
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Search & Match */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">搜索与匹配</h3>
              <p className="text-gray-600">
                ①
                求租人：输入租期、价格、位置，系统自动推荐最匹配房源；多维筛选；一键收藏/留言/预约看房。
              </p>
            </div>

            {/* Publish & Promote */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📤</div>
              <h3 className="text-xl font-semibold mb-3">发布与推广</h3>
              <p className="text-gray-600">
                ② 转租人：三步发布；系统自动推送给符合租期/预算/地段的求租人；后台管理功能。
              </p>
            </div>

            {/* Safety & Security */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-3">安全与保障</h3>
              <p className="text-gray-600">③ 押金托管；用户身份/资质审核；在线聊天减少纠纷。</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">{openFAQ === index ? '−' : '+'}</span>
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-4 bg-gray-50">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <div>
              <span className="text-lg">还没注册？</span>
              <a href="/register" className="ml-2 text-blue-600 hover:text-blue-700 font-medium">
                立即注册
              </a>
            </div>
            <div>
              <span className="text-lg">已有账号？</span>
              <a href="/login" className="ml-2 text-blue-600 hover:text-blue-700 font-medium">
                登录查看我的房源
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
