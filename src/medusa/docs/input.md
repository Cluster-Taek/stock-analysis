# Input

Renders a form input field

```tsx
import { Input } from "@medusajs/ui"

export default function InputDemo() {
  return (
    <div className="w-[250px]">
      <Input placeholder="Sales Channel Name" id="sales-channel-name" />
    </div>
  )
}

```

## Usage

***

```tsx
import { Input } from "@medusajs/ui"
```

```tsx
<Input placeholder="Placeholder" id="input-id" />
```

## API Reference

***

### Input Props

This component is based on the \`input\` element and supports all of its props

- size: (union) The input's size. Default: "base"

## Examples

***

### Password

```tsx
import { Input } from "@medusajs/ui"

export default function InputPassword() {
  return (
    <div className="w-[250px]">
      <Input id="password" type="password" defaultValue="supersecret" />
    </div>
  )
}

```

### Search

```tsx
import { Input } from "@medusajs/ui"

export default function InputSearch() {
  return (
    <div className="w-[250px]">
      <Input placeholder="Search" id="search-input" type="search" />
    </div>
  )
}

```

### Disabled

```tsx
import { Input } from "@medusajs/ui"

export default function InputDisabled() {
  return (
    <div className="w-[250px]">
      <Input placeholder="Disabled" id="disabled-input" disabled />
    </div>
  )
}

```

### Small

```tsx
import { Input } from "@medusajs/ui"

export default function InputSmall() {
  return (
    <div className="w-[250px]">
      <Input placeholder="First name" id="first-name" size="small" />
    </div>
  )
}

```

### Error state

You can leverage the native `aria-invalid` property to show an error state on your input:

```tsx
import { Input } from "@medusajs/ui"

export default function InputError() {
  return (
    <div className="w-[250px]">
      <Input
        placeholder="Sales Channel Name"
        id="sales-channel-name"
        aria-invalid={true}
      />
    </div>
  )
}

```
