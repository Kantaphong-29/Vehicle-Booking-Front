import React from 'react';
import { STATUS_CONFIG } from '../constants.js';

export default function StatusStamp({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`stamp ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
