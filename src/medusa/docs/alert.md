# Alert

A component for displaying important messages.

```tsx
import { Alert } from "@medusajs/ui"

export default function AlertDemo() {
  return <Alert>You are viewing Medusa docs.</Alert>
}

```

## Usage

***

```tsx
import { Alert } from "@medusajs/ui"
```

```tsx
<Alert>Here's a message</Alert>
```

## API Reference

***

### Alert Props

This component is based on the div element and supports all of its props

- variant: (union) The variant of the alert Default: "info"
- dismissible: (boolean) Whether the alert is dismissible Default: false

## Examples

***

### Success Alert

```tsx
import { Alert } from "@medusajs/ui"

export default function AlertSuccess() {
  return <Alert variant="success">Data updated successfully!</Alert>
}

```

### Warning Alert

```tsx
import { Alert } from "@medusajs/ui"

export default function AlertWarning() {
  return <Alert variant="warning">Be careful!</Alert>
}

```

### Error Alert

```tsx
import { Alert } from "@medusajs/ui"

export default function AlertError() {
  return <Alert variant="error">An error occured while updating data.</Alert>
}

```

### Dismissable Alert

```tsx
import { Alert } from "@medusajs/ui"

export default function AlertDismissable() {
  return <Alert dismissible={true}>You are viewing Medusa docs.</Alert>
}

```
