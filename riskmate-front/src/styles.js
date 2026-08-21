export const styles = {
  app: { display: 'flex', width: '100vw', background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 60%, #020617 100%)', color: '#f8fafc', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' },
  sidebar: { 
    width: '320px', 
    backgroundColor: '#1e293b', 
    padding: '24px', 
    display: 'flex', 
    flexDirection: 'column', 
    borderRight: '1px solid #334155', 
    boxShadow: '4px 0 15px rgba(0,0,0,0.1)', 
    zIndex: 10, 
    borderRadius: '0 24px 24px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',     // Висота сайдбару завжди дорівнює 100% висоти екрану
    overflowY: 'auto',
  },
  main: {
    flex: 1,
    padding: '20px',
    paddingBottom: '40px', /* Додаємо простір знизу */
    overflowY: 'auto',     /* Вмикаємо вертикальний скрол */
    minHeight: '100vh',       /* Фіксуємо висоту, щоб скролилась тільки ця частина */
    backgroundColor: '#000000', /* Або твій поточний колір фону */
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    border: '1px solid #334155',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px top 50%',
    backgroundSize: '12px auto',
  },
  button: { 
    width: '100%', 
    padding: '14px', 
    background: 'linear-gradient(90deg, #4f46e5, #6366f1)', 
    borderRadius: '12px', 
    border: 'none', 
    color: '#fff', 
    fontWeight: 'bold', 
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.2s',
    marginTop: '20px',

  },
  brand: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px', paddingBottom: '16px', borderBottom: '1px solid #334155' },
  logoText: { fontSize: '28px', fontWeight: '900', color: '#f8fafc', letterSpacing: '-0.5px' }, // Збільшена назва
  sectionTitle: { fontSize: '12px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '500' },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    backgroundColor: '#0f172a', 
    border: '1px solid #334155', 
    borderRadius: '12px', // Сильне закруглення для полів та списків
    color: '#f8fafc', 
    fontSize: '14px', 
    outline: 'none', 
    transition: 'border-color 0.2s' 
  },
  buttonPrimary: { width: '100%', padding: '14px', background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)', transition: 'transform 0.1s, opacity 0.2s' },
  headerInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageTitle: { fontSize: '28px', fontWeight: '700', margin: 0 },
  pageSubtitle: { color: '#94a3b8', fontSize: '15px', marginTop: '4px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' },
  kpiCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }, // Закруглення карток
  kpiLabel: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
  kpiValue: { fontSize: '24px', fontWeight: '700', color: '#f8fafc', marginTop: '8px' },
  kpiHighlight: { color: '#fb7185' },
  kpiHighlightCVaR: { color: '#f43f5e' },
  chartContainer: { flex: 1, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' } // Закруглення графіка
};