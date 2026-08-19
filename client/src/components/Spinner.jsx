import React from 'react';

const Spinner = ({ fullPage = false, size = 32, message = 'Loading...' }) => {
  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    border: '3px solid rgba(0, 212, 170, 0.2)',
    borderTopColor: 'var(--clr-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={spinnerStyle} />
      {message && <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Spinner;
