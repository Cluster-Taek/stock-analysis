# Avatar

An image element with a fallback for representing the user.

```tsx
import { Avatar } from "@medusajs/ui"

export default function AvatarDemo() {
  return (
    <Avatar
      src="https://avatars.githubusercontent.com/u/10656202?v=4"
      fallback="M"
    />
  )
}

```

## Usage

***

```tsx
import { Avatar } from "@medusajs/ui"
```

```tsx
<Avatar
  src="https://avatars.githubusercontent.com/u/10656202?v=4"
  fallback="M"
/>
```

## API Reference

***

### Avatar Props

This component is based on the \[Radix UI Avatar]\(https://www.radix-ui.com/primitives/docs/components/avatar) primitive.

- src: (string) The URL of the image used in the Avatar.
- fallback: (string) Text to show in the avatar if the URL provided in \`src\` can't be opened.
- variant: (union) The style of the avatar. Default: "rounded"
- size: (union) The size of the avatar's border radius. Default: "base"
