'use client';

import { useEffect, useState } from 'react';
import { PageHashtags } from '@/types';

interface SeoTagsProps {
  page: PageHashtags['page'];
}

export default function SeoTags({ page }: SeoTagsProps) {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/data/page_hashtags?id=${page}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((ht: PageHashtags | null) => {
        if (!cancelled && ht?.tags) setTags(ht.tags);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [page]);

  if (!tags.length) return null;

  return (
    <>
    <style>{`.gwaa-tags::-webkit-scrollbar{display:none}`}</style>
    <div className="gwaa-tags" style={{
      display: 'flex',
      flexWrap: 'nowrap',
      overflowX: 'auto',
      gap: 8,
      marginTop: 28,
      paddingBottom: 4,
      /* hide scrollbar */
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
    } as React.CSSProperties}>
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: 11,
            color: '#9ca3af',
            padding: '4px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 9999,
            letterSpacing: '0.03em',
            flexShrink: 0,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
    </>
  );
}
