# Toast

A succinct message that is displayed temporarily.

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterDemo() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.info("Info", {
            description: "The quick brown fox jumps over the lazy dog.",
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

## Usage

***

Import the `toast` utility and `Toaster` component from `@medusajs/ui`:

```tsx
import { Toaster, toast } from "@medusajs/ui"
```

Then, add the `Toaster` component somewhere in your tree:

```tsx
<Toaster />
```

Finally, use the `toast` utility to display a toast:

```tsx
return (
  <Button 
    onClick={() => 
      toast.info("Toast title", {
        description: "Toast body",
      })
    }
  >
    Trigger
  </Button>
)
```

## API Reference

***

### Toast Utility Functions

The `toast` utility has the following functions to display different variants of toasts:

- `info`
- `error`
- `success`
- `warning`
- `loading`

Each of these functions accept two parameters:

1. A string indicating the title of the toast.
2. An object of props to pass to the underlying `Toast` component.

### Toast Props

### Toast Props

This component is based on the \[Sonner]\(https://sonner.emilkowal.ski/toast) toast library.

- id: (union) Optional ID of the toast.
- description: (ReactReactNode) The toast's text.
- action: (signature) The toast's action buttons.

### Toaster Props

### Toaster Props

This component is based on the \[Toaster component of the Sonner library]\(https://sonner.emilkowal.ski/toaster).

- position: (Position) The position of the created toasts. Default: "bottom-right"
- gap: (number) The gap between the toast components. Default: 12
- offset: (union) The space from the edges of the screen. Default: 24
- duration: (number) The time in milliseconds that a toast is shown before it's
  automatically dismissed.

  &#x20;Default: 4000

## Examples

***

### Dismissable Toast

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function DismissableToaster() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.info("Info", {
            description: "The quick brown fox jumps over the lazy dog.",
            dismissable: true,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

### Warning

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterWarning() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.warning("Warning", {
            description: "The quick brown fox jumps over the lazy dog.",
            duration: 5000,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

### Error

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterError() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.error("Error", {
            description: "The quick brown fox jumps over the lazy dog.",
            duration: 5000,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

### Success

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterSuccess() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.success("Success", {
            description: "The quick brown fox jumps over the lazy dog.",
            duration: 5000,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

### Loading

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterLoading() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.loading("Loading", {
            description: "The quick brown fox jumps over the lazy dog.",
            duration: 5000,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```

### With Action

```tsx
import { Button, Toaster, toast } from "@medusajs/ui"

export default function ToasterWithAction() {
  return (
    <>
      <Toaster />
      <Button
        onClick={() =>
          toast.success("Created Product", {
            description: "The product has been created.",
            action: {
              altText: "Undo product creation",
              onClick: () => {},
              label: "Undo",
            },
            duration: 10000,
          })
        }
      >
        Show
      </Button>
    </>
  )
}

```
