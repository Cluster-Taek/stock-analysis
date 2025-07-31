# Label

Renders an accessible label associated with controls.

```tsx
import { Label } from "@medusajs/ui"

export default function LabelDemo() {
  return <Label>Regular label</Label>
}

```

## Usage

***

```tsx
import { Label } from "@medusajs/ui"
```

```tsx
<Label>Label</Label>
```

## API Reference

***

### Label Props

This component is based on the \[Radix UI Label]\(https://www.radix-ui.com/primitives/docs/components/label) primitive.

- size: (union) The label's size. Default: "base"
- weight: (union) The label's font weight. Default: "regular"

## Examples

***

### Base Regular

```tsx
import { Label } from "@medusajs/ui"

export default function LabelBaseRegular() {
  return (
    <Label size="base" weight="regular">
      Label
    </Label>
  )
}

```

### Base Plus

```tsx
import { Label } from "@medusajs/ui"

export default function LabelBasePlus() {
  return (
    <Label size="base" weight="plus">
      Label
    </Label>
  )
}

```

### Large Regular

```tsx
import { Label } from "@medusajs/ui"

export default function LabelLargeRegular() {
  return (
    <Label size="large" weight="regular">
      Label
    </Label>
  )
}

```

### Large Plus

```tsx
import { Label } from "@medusajs/ui"

export default function LabelLargePlus() {
  return (
    <Label size="large" weight="plus">
      Label
    </Label>
  )
}

```

### Small Regular

```tsx
import { Label } from "@medusajs/ui"

export default function LabelSmallRegular() {
  return (
    <Label size="small" weight="regular">
      Label
    </Label>
  )
}

```

### Small Plus

```tsx
import { Label } from "@medusajs/ui"

export default function LabelSmallPlus() {
  return (
    <Label size="small" weight="plus">
      Label
    </Label>
  )
}

```

### X-Small Regular

```tsx
import { Label } from "@medusajs/ui"

export default function LabelXSmallRegular() {
  return (
    <Label size="xsmall" weight="regular">
      Label
    </Label>
  )
}

```

### X-Small Plus

```tsx
import { Label } from "@medusajs/ui"

export default function LabelXSmallPlus() {
  return (
    <Label size="xsmall" weight="plus">
      Label
    </Label>
  )
}

```
