# Currency Input

Input component for currency values

```tsx
import { CurrencyInput } from "@medusajs/ui"

export default function CurrencyInputDemo() {
  return (
    <div className="max-w-[250px]">
      <CurrencyInput symbol="$" code="usd" />
    </div>
  )
}

```

## Usage

***

```tsx
import { CurrencyInput } from "@medusajs/ui"
```

```tsx
<CurrencyInput symbol="$" code="usd" />
```

## API Reference

***

### CurrencyInput Props

This component is based on the input element and supports all of its props

- symbol: (string) The symbol to show in the input.
- code: (string) The currency code to show in the input.
- size: (union) The input's size. Default: "base"
- allowDecimals: (boolean) Allow decimals

  Default = true
- allowNegativeValue: (boolean) Allow user to enter negative value

  Default = true
- className: (string) Class names
- customInput: (ElementType) Custom component

  Default = \<input/>
- decimalScale: (number) Specify decimal scale for padding/trimming

  Example:
  &#x20; 1.5 -> 1.50
  &#x20; 1.234 -> 1.23
- decimalSeparator: (string) Separator between integer part and fractional part of value.

  This cannot be a number
- decimalsLimit: (number) Limit length of decimals allowed

  Default = 2
- defaultValue: (union) Default value if not passing in value via props
- disableAbbreviations: (boolean) Disable abbreviations (m, k, b)

  Default = false
- disabled: (boolean) Disabled

  Default = false
- disableGroupSeparators: (boolean) Disable auto adding separator between values eg. 1000 -> 1,000

  Default = false
- fixedDecimalLength: (number) Value will always have the specified length of decimals

  Example:
  &#x20; 123 -> 1.23

  Note: This formatting only happens onBlur
- formatValueOnBlur: (boolean) When set to false, the formatValueOnBlur flag disables the application of the \_\_onValueChange\_\_ function
  specifically on blur events. If disabled or set to false, the onValueChange will not trigger on blur.
  Default = true
- groupSeparator: (string) Separator between thousand, million and billion

  This cannot be a number
- id: (string) Component id
- intlConfig: (IntlConfig) International locale config, examples:
  &#x20; \{ locale: 'ja-JP', currency: 'JPY' }
  &#x20; \{ locale: 'en-IN', currency: 'INR' }

  Any prefix, groupSeparator or decimalSeparator options passed in
  will override Intl Locale config
- maxLength: (number) Maximum characters the user can enter
- onValueChange: (signature) Handle change in value
- placeholder: (string) Placeholder if there is no value
- step: (number) Incremental value change on arrow down and arrow up key press
- transformRawValue: (signature) Transform the raw value form the input before parsing

## Examples

***

### Base

```tsx
import { CurrencyInput } from "@medusajs/ui"

export default function CurrencyInputBase() {
  return (
    <div className="max-w-[250px]">
      <CurrencyInput size="base" symbol="$" code="usd" />
    </div>
  )
}

```

### Small

```tsx
import { CurrencyInput } from "@medusajs/ui"

export default function CurrencyInputSmall() {
  return (
    <div className="max-w-[250px]">
      <CurrencyInput size="small" symbol="$" code="usd" />
    </div>
  )
}

```
