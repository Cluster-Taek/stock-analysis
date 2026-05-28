# Inline Tip

A component for displaying a note or tip inline.

```tsx
import { InlineTip } from "@medusajs/ui"

export default function InlineTipDemo() {
  return (
    <InlineTip
      label="Tip"
    >
      Medusa UI is a package of React components to be used in Medusa Admin customizations.
    </InlineTip>
  )
}
```

## Usage

***

```tsx
import { InlineTip } from "@medusajs/ui"
```

```tsx
<InlineTip
  label="This is a tip"
>
  <button>Hover me</button>
</InlineTip>
```

## API Reference

***

### InlineTip Props

This component is based on the \`div\` element and supports all of its props.

- label: (string) The label to display in the tip.
- variant: (union) The variant of the tip. Default: "info"

## Examples

***

### Success Inline Tip

```tsx
import { InlineTip } from "@medusajs/ui"

export default function InlineTipSuccess() {
  return (
    <InlineTip
      label="Success"
      variant="success"
    >
      Product created successfully!
    </InlineTip>
  )
}
```

### Warning Inline Tip

```tsx
import { InlineTip } from "@medusajs/ui"

export default function InlineTipWarning() {
  return (
    <InlineTip
      label="Warning"
      variant="warning"
    >
      This action cannot be undone.
    </InlineTip>
  )
}
```

### Error Inline Tip

```tsx
import { InlineTip } from "@medusajs/ui"

export default function InlineTipError() {
  return (
    <InlineTip
      label="Error"
      variant="error"
    >
      An error occurred. Please try again.
    </InlineTip>
  )
}
```
