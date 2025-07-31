# Switch

A control that allows the user to toggle between checked and not checked.

```tsx
import { Label, Switch } from "@medusajs/ui"

export default function SwitchDemo() {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory" />
      <Label htmlFor="manage-inventory">Manage Inventory</Label>
    </div>
  )
}

```

## Usage

***

```tsx
import { Switch } from "@medusajs/ui"
```

```tsx
<Switch />
```

## API Reference

***

### Switch Props

This component is based on the \[Radix UI Switch]\(https://www.radix-ui.com/primitives/docs/components/switch) primitive.

- size: (union) The switch's size. Default: "base"

## Examples

***

### Small

```tsx
import { Label, Switch } from "@medusajs/ui"

export default function SwitchSmall() {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory-small" size="small" />
      <Label htmlFor="manage-inventory-small" size="small">
        Manage Inventory
      </Label>
    </div>
  )
}

```

### Disabled

```tsx
import { Label, Switch } from "@medusajs/ui"

export default function SwitchDisabled() {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory-disabled" disabled={true} />
      <Label htmlFor="manage-inventory-disabled">Manage Inventory</Label>
    </div>
  )
}

```

### Checked

```tsx
import { Label, Switch } from "@medusajs/ui"

export default function SwitchChecked() {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory-checked" checked={true} />
      <Label htmlFor="manage-inventory-checked">Manage Inventory</Label>
    </div>
  )
}

```

### Checked Disabled

```tsx
import { Label, Switch } from "@medusajs/ui"

export default function SwitchCheckedDisabled() {
  return (
    <div className="flex items-center gap-x-2">
      <Switch
        id="manage-inventory-checked-disabled"
        checked={true}
        disabled={true}
      />
      <Label htmlFor="manage-inventory-checked-disabled">
        Manage Inventory
      </Label>
    </div>
  )
}

```
