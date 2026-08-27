import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

// Компонент одного запитання, яке розгортається
const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div style={{ marginBottom: '15px', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', transition: 'all 0.3s' }}>
      <button
        onClick={onClick}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px', backgroundColor: isOpen ? '#1e293b' : '#0f172a',
          border: 'none', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 'bold',
          cursor: 'pointer', transition: 'background-color 0.3s'
        }}
      >
        <span style={{ textAlign: 'left' }}>{title}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', color: '#3b82f6' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '20px', backgroundColor: '#1e293b', color: '#cbd5e1', borderTop: '1px solid #334155', lineHeight: '1.6', fontSize: '1rem' }}>
          {content}
        </div>
      )}
    </div>
  );
};

const Guide = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(0);

  // РОЗШИРЕНИЙ СПИСОК ПИТАНЬ
  const faqs = [
    {
      title: "Що таке Value at Risk (VaR)?",
      content: "VaR (Вартість під ризиком) — це статистична метрика, яка показує максимально можливий збиток активу за певний період часу із заданим рівнем довіри. Наприклад, якщо VaR 95% на 30 днів становить $500, це означає, що з імовірністю 95% ваші збитки за цей місяць не перевищать $500. Це стандартна метрика в банківській сфері."
    },
    {
      title: "Що таке Conditional VaR (CVaR)?",
      content: "CVaR (Умовна вартість під ризиком або Expected Shortfall) — це метрика для екстремальних ситуацій. Вона розраховує середній розмір збитку в тих випадках, коли ринок пробиває ваш VaR. Тобто, якщо найгірший сценарій (ті самі 5%) все ж настав, CVaR покаже, скільки в середньому ви втратите. Це більш надійна міра ризику за стандартом Basel III."
    },
    {
      title: "Що таке Волатильність (Volatility)?",
      content: "Волатильність — це статистична міра розкиду доходності для даного цінного паперу або ринкового індексу. У більшості випадків чим вища волатильність, тим ризикованіший актив. У Rizix ми використовуємо історичну волатильність для налаштування симуляцій Монте-Карло."
    },
    {
      title: "Як розраховується Очікувана дохідність (Expected Return)?",
      content: "Очікувана дохідність — це середнє значення всіх можливих доходностей, екстрапольоване на майбутнє. У нашому додатку вона базується на історичних даних активу і використовується як параметр 'дрейфу' (drift) у моделі геометричного броунівського руху (GBM)."
    },
    {
      title: "Що означає Безризикова ставка (Risk-Free Rate)?",
      content: "Це теоретична ставка дохідності інвестицій з нульовим ризиком (зазвичай це дохідність державних облігацій, наприклад, США). Вона використовується в Rizix для розрахунку коефіцієнта Шарпа, щоб зрозуміти, чи виправданий ризик порівняно з безпечним зберіганням грошей."
    },
    {
      title: "Як розуміти Коефіцієнт Шарпа (Sharpe Ratio)?",
      content: "Коефіцієнт Шарпа показує, наскільки дохідність активу компенсує прийнятий ризик. Розраховується як відношення дохідності (мінус безризикова ставка) до волатильності. Значення вище 1.0 вважається хорошим, вище 2.0 — чудовим. Якщо коефіцієнт менший за 1.0, це означає, що ризик завищений порівняно з очікуваним прибутком."
    },
    {
      title: "Що таке Максимальне просідання (Max Drawdown)?",
      content: "Це історичний показник найгіршого сценарію, який уже траплявся з активом. Він вимірює падіння ціни від найвищого піку до найнижчого дна перед тим, як ціна знову почала зростати. Цей показник допомагає інвесторам психологічно підготуватися до можливих шоків."
    },
    {
      title: "Чому Монте-Карло краще за просте прогнозування?",
      content: "Традиційні прогнози часто малюють лише одну 'очікувану' лінію. Симуляція Монте-Карло генерує тисячі можливих сценаріїв розвитку подій, враховуючи випадковість ринку. Це дозволяє побачити не лише середній результат, але й розподіл імовірностей екстремальних збитків."
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <PageTransition>
        <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '30px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
        >
          <span>←</span> Повернутися на головну
        </button>

        <h1 style={{ fontSize: '3rem', marginBottom: '15px', background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Довідник інвестора
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px', lineHeight: '1.6' }}>
          Фінанси не повинні бути складними. Тут ми просто і зрозуміло пояснюємо основні терміни та індикатори, які використовуються в Rizix.
        </p>

        <div>
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index}
              title={faq.title}
              content={faq.content}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

      </div>
    </div>
    </PageTransition>
  );
};

export default Guide;