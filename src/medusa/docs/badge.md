# Badge

Displays a badge

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeDemo() {
  return <Badge>Badge</Badge>
}

```

## Usage

***

```tsx
import { Badge } from "@medusajs/ui"
```

```tsx
<Badge>Badge</Badge>
```

## API Reference

***

### Badge Props

This component is based on the \`div\` element and supports all of its props

- asChild: (boolean) Whether to remove the wrapper \`span\` element and use the
  passed child element instead. Default: false
- size: (union) The badge's size. Default: "base"
- rounded: (union) The style of the badge's border radius. Default: "base"
- color: (union) The badge's color. Default: "grey"

## Examples

***

### Grey

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeGrey() {
  return <Badge color="grey">Badge</Badge>
}

```

### Red

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeRed() {
  return <Badge color="red">Badge</Badge>
}

```

### Green

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeGreen() {
  return <Badge color="green">Badge</Badge>
}

```

### Blue

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeBlue() {
  return <Badge color="blue">Badge</Badge>
}

```

### Orange

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeOrange() {
  return <Badge color="orange">Badge</Badge>
}

```

### Purple

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgePurple() {
  return <Badge color="purple">Badge</Badge>
}

```

### Small

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeSmall() {
  return <Badge size="small">Badge</Badge>
}

```

### Large

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeLarge() {
  return <Badge size="large">Badge</Badge>
}

```

### Rounded Full

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeRoundedFull() {
  return <Badge rounded="full">Badge</Badge>
}

```

### Rounded Base

```tsx
import { Badge } from "@medusajs/ui"

export default function BadgeRoundedBase() {
  return <Badge rounded="base">Badge</Badge>
}

```
