# Icon Button

Displays an icon button

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonDemo() {
  return (
    <IconButton>
      <PlusMini />
    </IconButton>
  )
}

```

## Usage

***

```tsx
import { IconButton } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"
```

```tsx
<IconButton>
  <Plus />
</IconButton>
```

## API Reference

***

### IconButton Props

This component is based on the \`button\` element and supports all of its props

- asChild: (boolean) Whether to remove the wrapper \`button\` element and use the
  passed child element instead. Default: false
- isLoading: (boolean) Whether to show a loading spinner. Default: false
- variant: (union) The button's style. Default: "primary"
- size: (union) The button's size. Default: "base"

## Examples

***

### Primary

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonPrimary() {
  return (
    <IconButton variant="primary">
      <PlusMini />
    </IconButton>
  )
}

```

### Transparent

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonTransparent() {
  return (
    <IconButton variant="transparent">
      <PlusMini />
    </IconButton>
  )
}

```

### Base

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonBase() {
  return (
    <IconButton size="base">
      <PlusMini />
    </IconButton>
  )
}

```

### Large

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonLarge() {
  return (
    <IconButton size="large">
      <PlusMini />
    </IconButton>
  )
}

```

### X-Large

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonXLarge() {
  return (
    <IconButton size="xlarge">
      <PlusMini />
    </IconButton>
  )
}

```

### Disabled

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonDisabled() {
  return (
    <IconButton disabled>
      <PlusMini />
    </IconButton>
  )
}

```

### Loading

```tsx
import { PlusMini } from "@medusajs/icons"
import { IconButton } from "@medusajs/ui"

export default function IconButtonLoading() {
  return (
    <IconButton isLoading>
      <PlusMini />
    </IconButton>
  )
}

```
