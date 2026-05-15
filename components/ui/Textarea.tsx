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
          padding: '11px 16px',
          border: `1.5px solid ${focused ? '#16a34a' : '#e5e7eb'}`,
          borderRadius: 10,
          fontSize: 14,
          color: '#111',
          outline: 'none',
          boxSizing: 'border-box',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          background: '#fff',
          transition: 'border-color 0.2s',
          resize: 'vertical',
          minHeight: 120,
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
