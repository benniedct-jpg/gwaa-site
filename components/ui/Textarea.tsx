'use client';

import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <textarea
        ref={ref}
        style={{
          width: '100%',
          padding: '12px 16px',
          border: `1.5px solid ${focused ? '#16a34a' : '#e5e7eb'}`,
          borderRadius: 10,
          fontSize: 15,
          color: '#111',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue','Apple SD Gothic Neo','Noto Sans KR',sans-serif",
          background: focused ? '#fff' : '#fafafa',
          boxShadow: focused
            ? '0 0 0 3px rgba(22,163,74,0.12), 0 1px 3px rgba(0,0,0,0.05)'
            : '0 1px 2px rgba(0,0,0,0.03)',
          transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s',
          resize: 'vertical',
          minHeight: 120,
          lineHeight: 1.7,
          ...style,
        }}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e)  => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
