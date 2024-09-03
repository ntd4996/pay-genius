import { cn } from '@nextui-org/react';
import React from 'react';
import CurrencyInput from 'react-currency-input-field';

interface TypeProps {
  label: string;
  onChange: (e: string | undefined | null) => void;
  value?: string;
  className?: string;
  isDisabled?: boolean;
}

export default function NumberInput(props: TypeProps) {
  const { label, value, onChange, className, isDisabled } = props;
  return (
    <div
      className={cn(
        'group relative inline-flex h-14 min-h-unit-10 w-full cursor-text flex-col items-start justify-center gap-0 rounded-medium border-medium border-default-200 px-3 py-2 shadow-sm transition-colors !duration-150 tap-highlight-transparent transition-background focus-within:border-default-foreground motion-reduce:transition-none',
        className
      )}
    >
      <label className='pointer-events-auto absolute z-10 block max-w-full origin-top-left -translate-y-[calc(50%_+_theme(fontSize.small)/2_-_6px_-_theme(borderWidth.medium))] scale-85 cursor-text overflow-hidden text-ellipsis pe-2 text-small text-default-600 subpixel-antialiased transition-[transform,color,left,opacity] !duration-200 !ease-out will-change-auto motion-reduce:transition-none'>
        {label}
      </label>
      <div className='box-border inline-flex h-full w-full items-center group-data-[has-label=true]:items-end'>
        <CurrencyInput
          placeholder='0'
          decimalSeparator=','
          groupSeparator='.'
          decimalsLimit={2}
          value={value}
          onValueChange={(value, name, values) => {
            onChange(value);
          }}
          className='w-full bg-transparent pt-[20px] text-small font-normal !outline-none placeholder:text-foreground-500 focus:outline-none focus-visible:outline-none data-[has-end-content=true]:pe-1.5 data-[has-start-content=true]:ps-1.5'
          disabled={isDisabled}
        />
        <div className='pointer-events-none flex items-center'>
          <span className='text-small text-default-400'>₫</span>
        </div>
      </div>
    </div>
  );
}
