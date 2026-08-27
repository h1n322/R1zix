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
            Додаток Rizix використовує передові математичні моделі та алгоритми штучного інтелекту для прогнозування поведінки фінансових ринків.
          </p>

          {/* Секція 1: Монте-Карло */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Метод Монте-Карло</h2>
            <p className={styles.text}>
              Метод Монте-Карло — це клас обчислювальних алгоритмів, що спираються на багаторазове випадкове моделювання для отримання числових результатів. У фінансах він використовується для моделювання ймовірності різних результатів у процесі, який неможливо легко передбачити через втручання випадкових змінних.
            </p>
            <p className={styles.text}>
              Rizix генерує тисячі можливих траєкторій ціни активу на заданий горизонт часу (наприклад, 30 днів), що дозволяє побачити не лише середній очікуваний результат, але й спектр найгірших та найкращих сценаріїв.
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
              На додаток до класичних стохастичних моделей, Rizix впроваджує рекурентні нейронні мережі архітектури <span className={styles.boldText}>Long Short-Term Memory (LSTM)</span> для глибшого аналізу ринкових трендів.
            </p>
            <p className={styles.text}>
              Мережі LSTM ідеально підходять для прогнозування фінансових часових рядів, оскільки вони здатні запам'ятовувати довгострокові залежності та виявляти складні нелінійні патерни, які класичні моделі (наприклад, ARIMA або чистий GBM) можуть пропустити. Ми використовуємо ШІ для коригування параметра очікуваної дохідності (drift), роблячи симуляції Монте-Карло більш адаптивними до поточних ринкових умов.
            </p>
          </section>

          {/* Секція 5: Типи Алгоритмів */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>5. Типи алгоритмів у системі</h2>
            <p className={styles.text}>
              Rizix дозволяє обрати математичну модель, яка найкраще відповідає вашій задачі. У панелі доступні наступні алгоритми:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.boldText}>Classic GBM Monte Carlo</span> — класична стохастична модель, яка припускає плавні і неперервні зміни ціни (геометричний броунівський рух). <br/><i>Для чого:</i> Аналіз високоліквідних, стабільних акцій (Apple, Microsoft) або широких ринкових індексів (S&P 500) у спокійні періоди.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Merton Jump Diffusion</span> — вдосконалена модель, яка додатково враховує раптові "стрибки" (jumps) цін. <br/><i>Для чого:</i> Симуляція волатильних активів, криптовалют, або акцій перед публікацією квартальних звітів (коли можливі розриви в ціні).
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Historical Simulation</span> — емпіричний метод, що генерує майбутні траєкторії виключно шляхом випадкової вибірки (букрепінгу) реальних минулих змін цін. Не припускає "нормального розподілу".<br/><i>Для чого:</i> Оцінка ризиків (VaR) "як є", спираючись виключно на реальні факти. Дуже корисно для стрес-тестування на базі попередніх ринкових криз.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>GARCH Volatility</span> — просунута економетрична модель (Generalized Autoregressive Conditional Heteroskedasticity). Моделює ефект "кластеризації волатильності" (штормові періоди йдуть за штормовими, спокійні — за спокійними).<br/><i>Для чого:</i> Ідеально для динамічного прогнозування волатильності в кризові моменти. Допомагає зрозуміти, чи буде ринок "заспокоюватись", чи нестабільність тільки набирає обертів.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>LSTM AI Predictor</span> — симуляція, де очікуваний напрямок руху (drift) коригується за допомогою Штучного Інтелекту (Long Short-Term Memory нейромереж). <br/><i>Для чого:</i> Для виявлення прихованих, довгострокових нелінійних патернів у ринкових трендах, які класична математика може не помітити.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Markowitz Portfolio Optimization</span> — алгоритм з Сучасної Теорії Портфеля (Нобелівська премія). Працює не з одним активом, а з портфелем (введіть кілька тикерів через кому, наприклад <code>AAPL,MSFT,TSLA</code>). Аналізує кореляції між ними.<br/><i>Для чого:</i> Щоб знайти ідеальні пропорції (ваги) кожного активу. Дозволяє побудувати "Ефективний рубіж" (Efficient Frontier) та зібрати портфель, який дасть максимальну дохідність при мінімальному ризику.
              </li>
            </ul>
          </section>

          {/* Секція 6: Дзвін Монте-Карло */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>6. Дзвін Монте-Карло (Розподіл ймовірностей)</h2>
            <p className={styles.text}>
              Після проведення тисяч симуляцій ми не отримуємо одну конкретну ціну, ми отримуємо цілий спектр можливих цін. <span className={styles.boldText}>Дзвін Монте-Карло (Гістограма розподілу)</span> візуалізує цей спектр:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}><b>Висота стовпчика:</b> показує кількість симуляцій (ймовірність), які завершилися в цьому ціновому діапазоні. Найвищий стовпчик — це найімовірніший результат.</li>
              <li className={styles.listItem}><b>Червона зона:</b> сценарії, де ціна активу впала нижче очікуваного рівня (ризик збитків).</li>
              <li className={styles.listItem}><b>Зелена зона:</b> сценарії, де ціна зросла вище очікуваного рівня (оптимістичні прибутки).</li>
              <li className={styles.listItem}><b>Форма дзвону (Bell Curve):</b> зазвичай має форму нормального або логнормального розподілу. Чим ширший дзвін — тим вища волатильність і ризикованість активу.</li>
            </ul>
          </section>

          {/* Секція 7: Хеджування та Блек-Шоулз */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>7. Хеджування ризиків (Формула Блека-Шоулза)</h2>
            <p className={styles.text}>
              <span className={styles.boldText}>Хеджування</span> — це фінансова стратегія "страхування" ваших інвестицій від падіння ціни. У Rizix ми автоматично розраховуємо стратегію захисту за допомогою Put-опціонів. Якщо ціна активу падає, ваш опціон зростає в ціні, компенсуючи збитки.
            </p>
            <p className={styles.text}>
              Для точного розрахунку вартості такого страхування (премії опціону) Rizix використовує Нобелівську <span className={styles.boldText}>модель Блека-Шоулза (Black-Scholes)</span>. 
            </p>
            
            <div className={styles.formulaBox}>
              C = S₀ N(d₁) - X e^(-rT) N(d₂)<br />
              P = X e^(-rT) N(-d₂) - S₀ N(-d₁)
            </div>
            
            <ul className={styles.list}>
              <li className={styles.listItem}><b>Put-опціон:</b> дає вам право продати актив за заздалегідь визначеною ціною (Страйк-ціною), навіть якщо ринкова ціна обвалиться.</li>
              <li className={styles.listItem}><b>Страйк-ціна (X):</b> ціна, по якій ви "застрахували" свій актив (Rizix автоматично встановлює її на рівні VaR, щоб захистити вас від критичних збитків).</li>
              <li className={styles.listItem}><b>Премія за опціон:</b> вартість покупки цієї "страховки" на 1 акцію. Вона залежить від безризикової ставки (r), часу до експірації (T) та волатильності (σ).</li>
              <li className={styles.listItem}><b>Вартість хеджу (100 акцій):</b> оскільки на біржах опціони продаються лотами по 100 акцій, ми одразу показуємо вам загальну вартість одного стандартного контракту.</li>
            </ul>
          </section>

          {/* Секція 8: Словник параметрів */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>8. Словник параметрів (Що вводити в системі?)</h2>
            <p className={styles.text}>
              Для того, щоб ви могли максимально ефективно користуватися Rizix, нижче наведено детальний опис кожного параметра з панелі керування.
            </p>

            <ul className={styles.list}>
              <li className={styles.listItem}>
                <span className={styles.boldText}>Актив (Тикер)</span> — короткий біржовий символ компанії (наприклад, <code>AAPL</code> для Apple, <code>MSFT</code> для Microsoft). Система використовує його для завантаження історичних цін з Yahoo Finance.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Тип алгоритму</span> — математична модель симуляції:
                <ul>
                  <li style={{marginTop: '4px'}}><b>Classic GBM Monte Carlo</b> — базова модель, що припускає плавну зміну цін. Підходить для стабільних компаній.</li>
                  <li style={{marginTop: '4px'}}><b>Merton Jump Diffusion</b> — просунута модель, яка додатково враховує раптові стрибки цін (кризи, несподівані новини, звіти). Краще підходить для волатильних активів.</li>
                </ul>
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Глибина історії</span> — період у минулому, за який система бере дані для розрахунку волатильності та трендів (від 1 до 10 років). 
                <br/><i>Порада:</i> Для короткострокових прогнозів беріть меншу історію (щоб захопити поточний настрій), для довгострокових — 5-10 років (щоб згладити тимчасові кризи).
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Рівень довіри (VaR)</span> — наскільки суворою буде оцінка ризику (90%, 95%, 99%).
                <br/><i>Порада:</i> Вибір 99% покаже вам максимально консервативний сценарій (готуємось до найгіршого). Стандартним у фінансах вважається 95%.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Симуляцій</span> — скільки паралельних всесвітів згенерує система (зазвичай від 1000 до 10000). Більша кількість дає точніший розподіл ймовірностей, але вимагає більше часу на розрахунок.
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Горизонт</span> — на скільки днів у майбутнє робиться прогноз (наприклад, 30 днів = 1 місяць).
              </li>
              
              <li className={styles.listItem}>
                <span className={styles.boldText}>Безризикова ставка (%)</span> — дохідність найбезпечніших активів у світі (наприклад, 10-річних держоблігацій США). Використовується для розрахунку Коефіцієнта Шарпа та премії за опціон (зазвичай зараз це близько 4-5%).
              </li>
            </ul>
          </section>

        </div>
      </div>
    </PageTransition>
  );
};

export default Methodology;