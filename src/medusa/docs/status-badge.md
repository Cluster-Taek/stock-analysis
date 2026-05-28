# Status Badge

Displays a status badge

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeDemo() {
  return <StatusBadge>Status</StatusBadge>
}

```

## Usage

***

```tsx
import { StatusBadge } from "@medusajs/ui"
```

```tsx
<StatusBadge color="green">Active</StatusBadge>
```

## API Reference

***

### StatusBadge Props

This component is based on the span element and supports all of its props

- color: (union) The status's color. Default: "grey"

## Examples

***

### Grey

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeGrey() {
  return <StatusBadge color="grey">Status</StatusBadge>
}

```

### Red

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeRed() {
  return <StatusBadge color="red">Status</StatusBadge>
}

```

### Green

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeGreen() {
  return <StatusBadge color="green">Status</StatusBadge>
}

```

### Blue

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeBlue() {
  return <StatusBadge color="blue">Status</StatusBadge>
}

```

### Orange

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgeOrange() {
  return <StatusBadge color="orange">Status</StatusBadge>
}

```

### Purple

```tsx
import { StatusBadge } from "@medusajs/ui"

export default function StatusBadgePurple() {
  return <StatusBadge color="purple">Status</StatusBadge>
}

```
