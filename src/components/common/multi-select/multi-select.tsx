import { Check, TrianglesMini } from '@medusajs/icons';
import { clx } from '@medusajs/ui';
import { cva } from 'cva';
import React, { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple: boolean;
  searchable: boolean;
  size: 'small' | 'base';
  disabled: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  dropdownPosition: 'bottom' | 'top';
  containerRef: React.RefObject<HTMLDivElement>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLUListElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  handleSelect: (value: string) => void;
  getSelectedOptions: () => Option[];
  filteredOptions: Option[];
  options: Option[];
  placeholder?: string;
  name?: string;
  required?: boolean;
}

const MultiSelectContext = createContext<MultiSelectContextType | undefined>(undefined);

const useMultiSelect = () => {
  const context = useContext(MultiSelectContext);
  if (!context) {
    throw new Error('MultiSelect compound components must be used within MultiSelect');
  }
  return context;
};

interface MultiSelectProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  children: React.ReactNode;
  value?: string[] | string;
  defaultValue?: string[] | string;
  onValueChange?: (value: string[] | string) => void;
  multiple?: boolean;
  searchable?: boolean;
  size?: 'small' | 'base';
  disabled?: boolean;
  placeholder?: string;
  name?: string;
  required?: boolean;
  'aria-invalid'?: boolean;
}

const MultiSelectRoot = forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      children,
      value: controlledValue,
      defaultValue,
      onValueChange,
      multiple = true,
      searchable = true,
      size = 'base',
      disabled = false,
      placeholder = 'Select options...',
      name,
      required = false,
      className = '',
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string[] | string>(defaultValue || (multiple ? [] : ''));

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const combinedRef = ref || containerRef;

    // Extract options from children
    const extractOptionsFromChildren = (children: React.ReactNode): Option[] => {
      const options: Option[] = [];

      const processContent = (content: React.ReactNode) => {
        React.Children.forEach(content, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === MultiSelectContent) {
              // Content 컴포넌트 안에서 List를 찾음
              processContent(child.props.children);
            } else if (child.type === MultiSelectItem) {
              // Item에서 옵션 정보 추출
              const { value, disabled = false, children: itemChildren } = child.props;
              const label =
                typeof itemChildren === 'string' ? itemChildren : React.Children.toArray(itemChildren).join('');
              options.push({ value, label, disabled });
            } else if (child.props?.children) {
              // 다른 컴포넌트라면 children을 재귀적으로 처리
              processContent(child.props.children);
            }
          }
        });
      };

      processContent(children);
      return options;
    };

    const options = extractOptionsFromChildren(children);

    const calculateDropdownPosition = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownMaxHeight = 240;
      const padding = 24;

      const spaceBelow = viewportHeight - containerRect.bottom - padding;
      const spaceAbove = containerRect.top - padding;

      setDropdownPosition(spaceBelow >= dropdownMaxHeight || spaceBelow > spaceAbove ? 'bottom' : 'top');
    };

    const handleValueChange = (newValue: string[] | string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    };

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        handleValueChange(
          currentValue.includes(optionValue)
            ? currentValue.filter((v) => v !== optionValue)
            : [...currentValue, optionValue]
        );
      } else {
        // Single select: 같은 값을 다시 클릭하면 선택 해제
        const newValue = value === optionValue ? '' : optionValue;
        handleValueChange(newValue);
        setIsOpen(false);
      }
      setSearchTerm('');
    };

    const getSelectedOptions = () => {
      if (multiple) {
        const currentValue = Array.isArray(value) ? value : [];
        return options.filter((option) => currentValue.includes(option.value));
      }
      const selectedOption = options.find((option) => option.value === value);
      return selectedOption ? [selectedOption] : [];
    };

    const filteredOptions = options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));

    useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
      if (isOpen) {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalOverflow;
        };
      }
    }, [isOpen]);

    useEffect(() => {
      if (isOpen) {
        calculateDropdownPosition();
        const targetElement = searchable ? searchInputRef.current : containerRef.current;
        try {
          targetElement?.focus();
        } catch {}
        setFocusedIndex(-1);
      }
    }, [isOpen, searchable]);

    useEffect(() => {
      if (focusedIndex !== -1 && listRef.current) {
        const focusedElement = listRef.current.children[focusedIndex];
        focusedElement?.scrollIntoView({ block: 'nearest' });
      }
    }, [focusedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      try {
        const { key, shiftKey } = e;
        const maxIndex = filteredOptions.length - 1;

        switch (key) {
          case 'Tab':
            e.preventDefault();
            if (searchable) {
              if (shiftKey && focusedIndex >= 0) {
                setFocusedIndex(-1);
                searchInputRef.current?.focus();
              } else if (!shiftKey && focusedIndex === -1 && filteredOptions.length > 0) {
                setFocusedIndex(0);
                containerRef.current?.focus();
              }
            }
            break;

          case 'ArrowDown':
            e.preventDefault();
            if (searchable && focusedIndex === -1) {
              setFocusedIndex(0);
              containerRef.current?.focus();
            } else {
              setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
            }
            break;

          case 'ArrowUp':
            e.preventDefault();
            if (searchable && focusedIndex === -1) return;
            if (focusedIndex === 0 && searchable) {
              setFocusedIndex(-1);
              searchInputRef.current?.focus();
            } else {
              setFocusedIndex((prev) => Math.max(prev - 1, 0));
            }
            break;

          case 'Enter':
            e.preventDefault();
            if (focusedIndex !== -1) {
              const focusedOption = filteredOptions[focusedIndex];
              if (focusedOption && !focusedOption.disabled) {
                handleSelect(focusedOption.value);
              }
            }
            break;

          case 'Escape':
            setIsOpen(false);
            break;
        }
      } catch (e) {
        console.error(e);
      }
    };

    const contextValue: MultiSelectContextType = {
      isOpen,
      setIsOpen,
      value,
      onChange: handleValueChange,
      multiple,
      searchable,
      size,
      disabled,
      searchTerm,
      setSearchTerm,
      focusedIndex,
      setFocusedIndex,
      dropdownPosition,
      containerRef,
      searchInputRef,
      listRef,
      dropdownRef,
      handleSelect,
      getSelectedOptions,
      filteredOptions,
      options,
      placeholder,
      name,
      required,
    };

    return (
      <MultiSelectContext.Provider value={contextValue}>
        <div
          ref={combinedRef}
          className={clx(
            'relative outline-none focus-visible:ring-2 focus-visible:ring-ui-border-interactive focus-visible:ring-offset-1 rounded-md',
            className
          )}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          aria-invalid={ariaInvalid}
          data-name={name}
          {...props}
        >
          {children}
          {name && (
            <input
              type="hidden"
              name={name}
              value={Array.isArray(value) ? JSON.stringify(value) : value}
              required={required && (Array.isArray(value) ? value.length === 0 : !value)}
            />
          )}
        </div>
      </MultiSelectContext.Provider>
    );
  }
);

MultiSelectRoot.displayName = 'MultiSelect';

const MultiSelectTrigger = forwardRef<HTMLButtonElement, { children: React.ReactNode }>(({ children }, ref) => {
  const { isOpen, setIsOpen, disabled, size } = useMultiSelect();

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <button
      ref={ref}
      onClick={handleToggle}
      className={triggerVariants({ size })}
      type="button"
      disabled={disabled}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      {children}
      <TrianglesMini className="text-ui-fg-muted group-disabled/trigger:text-ui-fg-disabled flex-shrink-0" />
    </button>
  );
});

MultiSelectTrigger.displayName = 'MultiSelectTrigger';

const MultiSelectValue: React.FC<{ placeholder?: string }> = ({ placeholder: propPlaceholder }) => {
  const { getSelectedOptions, multiple, placeholder: contextPlaceholder, size } = useMultiSelect();
  const selectedOptions = getSelectedOptions();
  const finalPlaceholder = propPlaceholder || contextPlaceholder;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selectedOptions.length > 0 ? (
        multiple ? (
          selectedOptions.map((option) => (
            <span key={option.value} className={badgeSizeVariants({ size })}>
              {option.label}
            </span>
          ))
        ) : (
          <span className="text-ui-fg-base txt-compact-xsmall">{selectedOptions[0].label}</span>
        )
      ) : (
        <span className="text-ui-fg-muted">{finalPlaceholder}</span>
      )}
    </div>
  );
};

const MultiSelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isOpen,
    setIsOpen,
    searchable,
    searchTerm,
    setSearchTerm,
    setFocusedIndex,
    filteredOptions,
    searchInputRef,
    containerRef,
    dropdownRef,
    dropdownPosition,
    multiple,
    onChange,
    options,
    size,
    listRef,
  } = useMultiSelect();

  if (!isOpen) return null;

  const handleSelectAll = () => onChange(options.map((option) => option.value));
  const handleClearAll = () => onChange([]);

  // Filter children based on search term
  const filterChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      if (child.type === MultiSelectItem) {
        const isVisible = filteredOptions.some((opt) => opt.value === child.props.value);
        return isVisible ? child : null;
      }

      if (child.props.children) {
        const newChildren = filterChildren(child.props.children);
        // 자식 요소가 변경되었을 때만 cloneElement를 사용하여 불필요한 리렌더링을 방지합니다.
        if (newChildren !== child.props.children) {
          return React.cloneElement(child, { ...child.props, children: newChildren });
        }
      }

      return child;
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-transparent" onClick={() => setIsOpen(false)} />
      <div
        ref={dropdownRef}
        className={dropdownVariants({ position: dropdownPosition })}
        style={{ [dropdownPosition === 'bottom' ? 'top' : 'bottom']: '100%' }}
        role="listbox"
      >
        {searchable && (
          <div className="p-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown' && filteredOptions.length > 0) {
                  e.preventDefault();
                  setFocusedIndex(0);
                  try {
                    containerRef.current?.focus();
                  } catch {}
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              placeholder="Search..."
              className="txt-compact-small w-full rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1.5 text-ui-fg-base placeholder-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"
            />
          </div>
        )}

        {multiple && (
          <div className="flex justify-between px-3 py-2 border-t border-ui-border-base">
            <button
              type="button"
              onClick={handleSelectAll}
              className={clx(
                'txt-compact-small-plus text-ui-fg-interactive hover:text-ui-fg-interactive-hover flex items-center gap-x-2',
                size === 'small' ? 'txt-compact-xsmall-plus' : 'txt-compact-small'
              )}
            >
              <Check />
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className={clx(
                'txt-compact-small-plus text-ui-fg-error hover:text-ui-fg-error-hover flex items-center gap-x-2',
                size === 'small' ? 'txt-compact-xsmall-plus' : 'txt-compact-small'
              )}
            >
              Clear All
            </button>
          </div>
        )}

        <ul
          ref={listRef}
          className="max-h-[200px] overflow-y-auto overscroll-contain p-1 scrollbar-hide"
          role="listbox"
        >
          {filterChildren(children)}
        </ul>
      </div>
    </>
  );
};

interface MultiSelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const MultiSelectItem: React.FC<MultiSelectItemProps> = ({ value, children, disabled = false }) => {
  const { handleSelect, value: selectedValue, multiple, focusedIndex, filteredOptions } = useMultiSelect();

  const index = filteredOptions.findIndex((option) => option.value === value);
  const isSelected = multiple ? Array.isArray(selectedValue) && selectedValue.includes(value) : selectedValue === value;

  return (
    <li
      onClick={() => !disabled && handleSelect(value)}
      className={optionVariants({
        isSelected,
        disabled,
        focused: index === focusedIndex,
      })}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
    >
      <span className="flex h-[15px] w-[15px] items-center justify-center">{isSelected && <Check />}</span>
      {children}
    </li>
  );
};

const MultiSelect = Object.assign(MultiSelectRoot, {
  Trigger: MultiSelectTrigger,
  Value: MultiSelectValue,
  Content: MultiSelectContent,
  Item: MultiSelectItem,
});

export default MultiSelect;

// Styles
const dropdownVariants = cva({
  base: clx(
    'absolute z-[9999] w-full overflow-hidden border rounded-lg shadow-elevation-flyout border-ui-border-base bg-ui-bg-component'
  ),
  variants: {
    position: {
      bottom: clx('mt-2.5', 'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 ease-out'),
      top: clx('mb-2.5', 'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200 ease-out'),
    },
  },
  defaultVariants: {
    position: 'bottom',
  },
});

const optionVariants = cva({
  base: clx(
    'bg-ui-bg-component grid cursor-pointer grid-cols-[15px_1fr] gap-x-2 rounded-[4px] px-2 py-1.5 outline-none transition-colors txt-compact-small items-center',
    'focus-visible:bg-ui-bg-component-hover',
    'active:bg-ui-bg-component-pressed',
    'hover:bg-ui-bg-base-hover'
  ),
  variants: {
    isSelected: {
      true: 'txt-compact-small-plus',
      false: '',
    },
    disabled: {
      true: 'text-ui-fg-disabled cursor-not-allowed',
      false: '',
    },
    focused: {
      true: 'bg-ui-bg-component-hover',
      false: '',
    },
  },
  defaultVariants: {
    isSelected: false,
    disabled: false,
    focused: false,
  },
});

const badgeSizeVariants = cva({
  base: clx(
    'inline-flex items-center gap-x-0.5 border box-border bg-ui-tag-neutral-bg text-ui-tag-neutral-text [&_svg]:text-ui-tag-neutral-icon border-ui-tag-neutral-border',
    'whitespace-nowrap'
  ),
  variants: {
    size: {
      small: 'txt-compact-2xsmall-plus px-1.5 rounded-md',
      base: 'txt-compact-xsmall-plus px-1 rounded-md',
    },
  },
  defaultVariants: {
    size: 'base',
  },
});

const triggerVariants = cva({
  base: clx(
    'relative bg-ui-bg-field shadow-buttons-neutral transition-fg flex w-full select-none items-center justify-between rounded-md outline-none',
    'data-[placeholder]:text-ui-fg-muted text-ui-fg-base',
    'hover:bg-ui-bg-field-hover',
    'focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active',
    'aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error',
    'invalid:border-ui-border-error invalid:shadow-borders-error',
    'disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled',
    'group/trigger'
  ),
  variants: {
    size: {
      base: 'min-h-8 px-2 py-1 txt-compact-small',
      small: 'min-h-7 px-2 py-1 txt-compact-small',
    },
  },
});
