# Checkbox

A control that allows the user to toggle between checked and not checked.

```tsx
import { Checkbox, Label } from "@medusajs/ui"

export default function CheckboxDemo() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="billing-shipping" />
      <Label htmlFor="billing-shipping">
        Billing address same as shipping address
      </Label>
    </div>
  )
}

```

## Usage

***

```tsx
import { Checkbox } from "@medusajs/ui"
```

```tsx
<Checkbox />
```

## API Reference

***

### Checkbox Props

This component is based on the \[Radix UI Checkbox]\(https://www.radix-ui.com/primitives/docs/components/checkbox) primitive.



## Examples

***

### Default

```tsx
import { Checkbox, Label } from "@medusajs/ui"

export default function CheckboxDefault() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="billing-shipping-default" />
      <Label htmlFor="billing-shipping-default">
        Billing address same as shipping address
      </Label>
    </div>
  )
}

```

### Checked

```tsx
import { Checkbox, Label } from "@medusajs/ui"

export default function CheckboxChecked() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="billing-shipping-checked" checked={true} />
      <Label htmlFor="billing-shipping-checked">
        Billing address same as shipping address
      </Label>
    </div>
  )
}

```

### Disabled

```tsx
import { Checkbox, Label } from "@medusajs/ui"

export default function CheckboxDisabled() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="billing-shipping-disabled" disabled={true} />
      <Label htmlFor="billing-shipping-disabled">
        Billing address same as shipping address
      </Label>
    </div>
  )
}

```

### Indeterminate

```tsx
import { Checkbox, Label } from "@medusajs/ui"

export default function CheckboxIndeterminate() {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="billing-shipping-indeterminate" checked={"indeterminate"} />
      <Label htmlFor="billing-shipping-indeterminate">
        Billing address same as shipping address
      </Label>
    </div>
  )
}

```
