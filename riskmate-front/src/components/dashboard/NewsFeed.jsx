import React from 'react';

const NewsFeed = ({ news }) => {
  // Якщо новин немає, показуємо заглушку замість того, щоб повністю ховати блок
  if (!news || news.length === 0) {
    return (
      <div style={{ backgroundColor: '#1C1C1E', borderRadius: '16px', padding: '20px', border: '1px solid #38383A', flex: 1, minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px' }}>Останні новини</h3>
        <p style={{ color: '#8E8E93', fontSize: '14px', fontStyle: 'italic' }}>Новин для цього активу тимчасово немає...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1C1C1E', borderRadius: '16px', padding: '20px', border: '1px solid #38383A', flex: 1, minWidth: '300px' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '1px' }}>Останні новини</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {news.map((item, idx) => {
          const date = new Date(item.timestamp * 1000).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={idx} style={{ borderBottom: idx === news.length - 1 ? 'none' : '1px solid #334155', paddingBottom: idx === news.length - 1 ? '0' : '10px' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: '500', fontSize: '14px', display: 'block', marginBottom: '4px', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#3b82f6'} onMouseOut={(e) => e.target.style.color = '#f8fafc'}>
                {item.title}
              </a>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                <span style={{ color: '#3b82f6' }}>{item.publisher}</span> • {date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFeed;