import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import styles from './PagesStyles/Methodology.module.css';

const Methodology = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className={styles.container}>
        <div className={styles.content}>
          
          {/* Кнопка "Назад" */}
          <button onClick={() => navigate('/')} className={styles.backBtn}>
            <span>←</span> Повернутися на головну
          </button>

          <h1 className={styles.title}>Наукова методологія</h1>
          <p className={styles.subtitle}>
            Додаток RiskMate використовує передові математичні моделі та алгоритми штучного інтелекту для прогнозування поведінки фінансових ринків.
          </p>

          {/* Секція 1: Монте-Карло */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Метод Монте-Карло</h2>
            <p className={styles.text}>
              Метод Монте-Карло — це клас обчислювальних алгоритмів, що спираються на багаторазове випадкове моделювання для отримання числових результатів. У фінансах він використовується для моделювання ймовірності різних результатів у процесі, який неможливо легко передбачити через втручання випадкових змінних.
            </p>
            <p className={styles.text}>
              RiskMate генерує тисячі можливих траєкторій ціни активу на заданий горизонт часу (наприклад, 30 днів), що дозволяє побачити не лише середній очікуваний результат, але й спектр найгірших та найкращих сценаріїв.
            </p>
          </section>

          {/* Секція 2: GBM */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Геометричний броунівський рух (GBM)</h2>
            <p className={styles.text}>
              Для генерації кожного кроку в симуляції використовується стохастичне диференціальне рівняння GBM. Модель припускає, що дохідність активу має нормальний розподіл, а сама ціна ніколи не падає нижче нуля.
            </p>
            
            {/* Виділений математичний блок */}
            <div className={styles.formulaBox}>
              S(t) = S(t-1) * exp[ (μ - σ²/2)Δt + σ * ε * √(Δt) ]
            </div>
            
            <ul className={styles.list}>
              <li className={styles.listItem}><b>S(t)</b> — ціна в момент часу t;</li>
              <li className={styles.listItem}><b>μ</b> (мю) — очікувана дохідність (drift);</li>
              <li className={styles.listItem}><b>σ</b> (сигма) — історична волатильність активу;</li>
              <li className={styles.listItem}><b>ε</b> (епсилон) — випадкова величина зі стандартного нормального розподілу N(0,1).</li>
            </ul>
          </section>

          {/* Секція 3: Метрики ризику */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Оцінка ризиків: VaR та CVaR</h2>
            <p className={styles.text}>
              <span className={styles.boldText}>Value at Risk (VaR)</span> — показує максимальний очікуваний збиток на заданому горизонті часу із заданим рівнем довіри (наприклад, 95%). Якщо VaR 95% дорівнює $100, це означає, що з імовірністю 95% ваші збитки не перевищать $100.
            </p>
            <p className={styles.text}>
              <span className={styles.boldText}>Conditional VaR (CVaR)</span> або Expected Shortfall — розраховує середній збиток у тих 5% найгірших випадків, коли збиток все ж перевищує VaR. Це більш консервативна і надійна метрика (рекомендована Базельським комітетом III), оскільки вона показує "що буде, якщо справи підуть зовсім погано".
            </p>
          </section>

          {/* Секція 4: Штучний інтелект LSTM */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>4. Інтеграція Штучного Інтелекту (LSTM)</h2>
            <p className={styles.text}>
              На додаток до класичних стохастичних моделей, RiskMate впроваджує рекурентні нейронні мережі архітектури <span className={styles.boldText}>Long Short-Term Memory (LSTM)</span> для глибшого аналізу ринкових трендів.
            </p>
            <p className={styles.text}>
              Мережі LSTM ідеально підходять для прогнозування фінансових часових рядів, оскільки вони здатні запам'ятовувати довгострокові залежності та виявляти складні нелінійні патерни, які класичні моделі (наприклад, ARIMA або чистий GBM) можуть пропустити. Ми використовуємо ШІ для коригування параметра очікуваної дохідності (drift), роблячи симуляції Монте-Карло більш адаптивними до поточних ринкових умов.
            </p>
          </section>

        </div>
      </div>
    </PageTransition>
  );
};

export default Methodology;