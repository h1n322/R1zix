import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
        <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '60px 20px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Кнопка "Назад" */}
        <button 
          onClick={() => navigate('/')} 
          style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '30px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0 }}
        >
          <span>←</span> Повернутися на головну
        </button>

        <h1 style={{ fontSize: '3rem', marginBottom: '20px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Наукова методологія
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '50px' }}>
          Додаток RiskMate використовує передові математичні моделі та алгоритми штучного інтелекту для прогнозування поведінки фінансових ринків.
        </p>

        {/* Секція 1: Монте-Карло */}
        <section style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '30px' }}>
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '15px' }}>1. Метод Монте-Карло</h2>
          <p style={{ color: '#cbd5e1' }}>
            Метод Монте-Карло — це клас обчислювальних алгоритмів, що спираються на багаторазове випадкове моделювання для отримання числових результатів. У фінансах він використовується для моделювання ймовірності різних результатів у процесі, який неможливо легко передбачити через втручання випадкових змінних.
          </p>
          <p style={{ color: '#cbd5e1' }}>
            RiskMate генерує тисячі можливих траєкторій ціни активу на заданий горизонт часу (наприклад, 30 днів), що дозволяє побачити не лише середній очікуваний результат, але й спектр найгірших та найкращих сценаріїв.
          </p>
        </section>

        {/* Секція 2: GBM */}
        <section style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '30px' }}>
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '15px' }}>2. Геометричний броунівський рух (GBM)</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
            Для генерації кожного кроку в симуляції використовується стохастичне диференціальне рівняння GBM. Модель припускає, що дохідність активу має нормальний розподіл, а сама ціна ніколи не падає нижче нуля.
          </p>
          <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', color: '#34d399', textAlign: 'center', marginBottom: '15px', fontSize: '1.1rem' }}>
            S(t) = S(t-1) * exp[ (μ - σ²/2)Δt + σ * ε * √(Δt) ]
          </div>
          <ul style={{ color: '#94a3b8', paddingLeft: '20px' }}>
            <li><b>S(t)</b> — ціна в момент часу t;</li>
            <li><b>μ</b> (мю) — очікувана дохідність (drift);</li>
            <li><b>σ</b> (сигма) — історична волатильність активу;</li>
            <li><b>ε</b> (епсилон) — випадкова величина зі стандартного нормального розподілу N(0,1).</li>
          </ul>
        </section>

        {/* Секція 3: Метрики ризику */}
        <section style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '30px' }}>
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '15px' }}>3. Оцінка ризиків: VaR та CVaR</h2>
          <p style={{ color: '#cbd5e1' }}>
            <b>Value at Risk (VaR)</b> — показує максимальний очікуваний збиток на заданому горизонті часу із заданим рівнем довіри (наприклад, 95%). Якщо VaR 95% дорівнює $100, це означає, що з імовірністю 95% ваші збитки не перевищать $100.
          </p>
          <p style={{ color: '#cbd5e1', marginTop: '15px' }}>
            <b>Conditional VaR (CVaR)</b> або Expected Shortfall — розраховує середній збиток у тих 5% найгірших випадків, коли збиток все ж перевищує VaR. Це більш консервативна і надійна метрика (рекомендована Базельським комітетом III), оскільки вона показує "що буде, якщо справи підуть зовсім погано".
          </p>
        </section>

        {/* НОВА СЕКЦІЯ 4: Штучний інтелект LSTM */}
        <section style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '30px' }}>
          <h2 style={{ color: '#e2e8f0', marginTop: 0, marginBottom: '15px' }}>4. Інтеграція Штучного Інтелекту (LSTM)</h2>
          <p style={{ color: '#cbd5e1', marginBottom: '15px' }}>
            На додаток до класичних стохастичних моделей, RiskMate впроваджує рекурентні нейронні мережі архітектури <b>Long Short-Term Memory (LSTM)</b> для глибшого аналізу ринкових трендів.
          </p>
          <p style={{ color: '#cbd5e1' }}>
            Мережі LSTM ідеально підходять для прогнозування фінансових часових рядів, оскільки вони здатні запам'ятовувати довгострокові залежності та виявляти складні нелінійні патерни, які класичні моделі (наприклад, ARIMA або чистий GBM) можуть пропустити. Ми використовуємо ШІ для коригування параметра очікуваної дохідності (drift), роблячи симуляції Монте-Карло більш адаптивними до поточних ринкових умов.
          </p>
        </section>

      </div>
    </div>
    </PageTransition>
  );
};

export default Methodology;