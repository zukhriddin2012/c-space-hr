'use client';

import { useState, useEffect } from 'react';
import TestBanner from './TestBanner';

export default function TestBannerWrapper() {
  const [isTestEnv, setIsTestEnv] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setIsTestEnv(data.isTestEnv))
      .catch(() => {});
  }, []);

  return <TestBanner isTestEnv={isTestEnv} />;
}
