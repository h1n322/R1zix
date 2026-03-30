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
  // Зберігаємо індекс відкритого питання (за замовчуванням відкрите перше)
  const [openIndex, setOpenIndex] = useState(0);

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
      title: "Як розуміти Коефіцієнт Шарпа (Sharpe Ratio)?",
      content: "Коефіцієнт Шарпа показує, наскільки дохідність активу компенсує прийнятий ризик. Розраховується як відношення дохідності (мінус безризикова ставка) до волатильності. Значення вище 1.0 вважається хорошим, вище 2.0 — чудовим. Якщо коефіцієнт менший за 1.0, це означає, що ризик завищений порівняно з очікуваним прибутком."
    },
    {
      title: "Що таке Максимальне просідання (Max Drawdown)?",
      content: "Це історичний показник найгіршого сценарію, який уже траплявся з активом. Він вимірює падіння ціни від найвищого піку до найнижчого дна перед тим, як ціна знову почала зростати. Цей показник допомагає інвесторам психологічно підготуватися до можливих шоків."
    },
    {
      title: "Що таке Лінії Боллінджера (Bollinger Bands)?",
      content: "Це технічний індикатор на графіку, який складається з трьох ліній. Центральна лінія — це проста ковзна середня (SMA 50). Верхня і нижня лінії відображають стандартні відхилення (волатильність). Якщо ціна торкається нижньої лінії — актив може бути перепроданим (хороший час для покупки). Якщо верхньої — перекупленим."
    },
    {
      title: "Як працює симуляція Монте-Карло в додатку?",
      content: "Додаток бере історичну волатильність і дохідність активу, а потім генерує тисячі випадкових, але математично обґрунтованих сценаріїв майбутнього (Геометричний броунівський рух). Ми рахуємо середнє значення цих тисяч сценаріїв, щоб дати вам найбільш імовірний прогноз та розрахувати ризики."
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
          Фінанси не повинні бути складними. Тут ми просто і зрозуміло пояснюємо основні терміни та індикатори, які використовуються в RiskMate.
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