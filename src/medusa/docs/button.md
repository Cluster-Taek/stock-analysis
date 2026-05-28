# Button

Displays a button

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonDemo() {
  return <Button>Button</Button>
}

```

## Usage

***

```tsx
import { Button } from "@medusajs/ui"
```

```tsx
<Button>Button</Button>
```

## API Reference

***

### Button Props

This component is based on the \`button\` element and supports all of its props

- isLoading: (boolean) Whether to show a loading spinner. Default: false
- asChild: (boolean) Whether to remove the wrapper \`button\` element and use the
  passed child element instead. Default: false
- variant: (union) The button's style. Default: "primary"
- size: (union) The button's size. Default: "base"

## Examples

***

### Primary

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonPrimary() {
  return <Button>Button</Button>
}

```

### Secondary

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonSecondary() {
  return <Button variant="secondary">Button</Button>
}

```

### Transparent

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonTransparent() {
  return <Button variant="transparent">Button</Button>
}

```

### Danger

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonDanger() {
  return <Button variant="danger">Button</Button>
}

```

### Disabled

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonDisabled() {
  return <Button disabled={true}>Button</Button>
}

```

### With Icon

```tsx
import { PlusMini } from "@medusajs/icons"
import { Button } from "@medusajs/ui"

export default function ButtonWithIcon() {
  return (
    <Button>
      Button <PlusMini />
    </Button>
  )
}

```

### Loading

```tsx
import { Button } from "@medusajs/ui"

export default function ButtonLoading() {
  return <Button isLoading={true}>Button</Button>
}

```
