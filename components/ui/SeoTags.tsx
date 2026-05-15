'use client';

import { useEffect, useState } from 'react';
import { gwaaDB, STORES } from '@/lib/db/gwaaDB';
import { PageHashtags } from '@/types';

interface SeoTagsProps {
  page: PageHashtags['page'];
}

export default function SeoTags({ page }: SeoTagsProps) {
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    gwaaDB.initDefaults().then(() =>
      gwaaDB.get<PageHashtags>(STORES.HASHTAGS, page).then((ht) => {
        if (ht?.tags) setTags(ht.tags);
      })
    );
  }, [page]);

  if (!tags.length) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28 }}>
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
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
