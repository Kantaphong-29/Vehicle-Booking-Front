import React from 'react';
import { Link } from 'react-router-dom';

export default function StatCard({ label, value, accent = 'navy', to }) {
  const accents = {
    navy: 'text-navy-800',
    gold: 'text-gold-600',
    sage: 'text-sage-600',
    amber: 'text-amber-600'
  };

  const content = (
    <>
      <p className="text-xs text-ink-500 mb-1.5">{label}</p>
      <p className={`font-display text-3xl ${accents[accent]}`}>{value}</p>
    </>
  );

  const baseClass = 'bg-paper-100 border border-ink-900/8 rounded-lg px-5 py-4 shadow-card block';

  if (to) {
    return (
      <Link to={to} className={`${baseClass} hover:border-navy-600/50 hover:shadow-md transition-all`}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}