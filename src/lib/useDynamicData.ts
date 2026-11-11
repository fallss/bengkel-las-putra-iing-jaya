'use client';

import { useState, useEffect } from 'react';

export function usePageContent(pageKey: string, initialDefaults: Record<string, string> = {}) {
  const [content, setContent] = useState<Record<string, string>>(initialDefaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pageKey) {
      setLoading(false);
      return;
    }
    fetch(`/api/content?page=${pageKey}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const mapped: Record<string, string> = { ...initialDefaults };
          for (const item of data.data) {
            mapped[item.section_key] = item.content;
          }
          setContent(mapped);
        }
      })
      .catch((e) => console.error('Failed to load dynamic content for', pageKey, e))
      .finally(() => setLoading(false));
  }, [pageKey]);

  return { content, loading };
}

export function useSiteSettings(initialDefaults: Record<string, string> = {}) {
  const [settings, setSettings] = useState<Record<string, string>>(initialDefaults);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
        }
      })
      .catch((e) => console.error('Failed to load settings', e));
  }, []);

  return settings;
}

