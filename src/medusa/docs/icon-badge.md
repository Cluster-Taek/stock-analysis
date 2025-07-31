# Icon Badge

Displays an icon badge

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeDemo() {
  return (
    <IconBadge>
      <BuildingTax />
    </IconBadge>
  )
}

```

## Usage

***

```tsx
import { IconBadge } from "@medusajs/ui"
import { BuildingTax } from "@medusajs/icons"
```

```tsx
<IconBadge>
  <BuildingTax />
</IconBadge>
```

## API Reference

***

### IconBadge Props

This component is based on the \`span\` element and supports all of its props

- asChild: (boolean) Whether to remove the wrapper \`span\` element and use the
  passed child element instead. Default: false
- color: (union) The badge's color. Default: "grey"
- size: (union) The badge's size. Default: "base"

## Examples

***

### Grey

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeGrey() {
  return (
    <IconBadge color="grey">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Red

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeRed() {
  return (
    <IconBadge color="red">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Green

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeGreen() {
  return (
    <IconBadge color="green">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Blue

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeBlue() {
  return (
    <IconBadge color="blue">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Orange

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeOrange() {
  return (
    <IconBadge color="orange">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Purple

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgePurple() {
  return (
    <IconBadge color="purple">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Base

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeBase() {
  return (
    <IconBadge size="base">
      <BuildingTax />
    </IconBadge>
  )
}

```

### Large

```tsx
import { BuildingTax } from "@medusajs/icons"
import { IconBadge } from "@medusajs/ui"

export default function IconBadgeLarge() {
  return (
    <IconBadge size="large">
      <BuildingTax />
    </IconBadge>
  )
}

```
