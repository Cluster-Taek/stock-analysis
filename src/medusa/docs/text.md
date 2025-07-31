# Text

Displays basic text.

```tsx
import { Text } from "@medusajs/ui"

export default function TextDemo() {
  return <Text>Text</Text>
}

```

## Usage

***

```tsx
import { Text } from "@medusajs/ui"
```

```tsx
<Text>Text</Text>
```

## API Reference

***

### Text Props

This component is based on the \`p\` element and supports all of its props

- asChild: (boolean) Whether to remove the wrapper \`button\` element and use the
  passed child element instead. Default: false
- as: (union) The wrapper element to use when \`asChild\` is disabled. Default: "p"
- size: (union) The text's size. Default: "base"
- weight: (union) The text's font weight. Default: "regular"
- family: (union) The text's font family. Default: "sans"
- leading: (union) The text's line height. Default: "normal"

## Examples

***

### All variations

```tsx
import { Text } from "@medusajs/ui"

export default function TextExamples() {
  return (
    <div className="flex flex-col items-start gap-y-2">
      <Text size="base" weight="regular" family="sans">
        Base Size, Regular Weight, Sans-Serif
      </Text>
      <Text size="base" weight="plus" family="sans">
        Base Size, Plus Weight, Sans-Serif
      </Text>
      <Text size="large" weight="regular" family="sans">
        Large Size, Regular Weight, Sans-Serif
      </Text>
      <Text size="large" weight="plus" family="sans">
        Large Size, Plus Weight, Sans-Serif
      </Text>
      <Text size="xlarge" weight="regular" family="sans">
        XLarge Size, Regular Weight, Sans-Serif
      </Text>
      <Text size="xlarge" weight="plus" family="sans">
        XLarge Size, Plus Weight, Sans-Serif
      </Text>
      <Text size="base" weight="regular" family="mono">
        Base Size, Regular Weight, Mono
      </Text>
      <Text size="large" weight="regular" family="mono">
        Large Size, Regular Weight, Mono
      </Text>
      <Text size="large" weight="plus" family="mono">
        Large Size, Plus Weight, Mono
      </Text>
      <Text size="xlarge" weight="regular" family="mono">
        XLarge Size, Regular Weight, Mono
      </Text>
      <Text size="xlarge" weight="plus" family="mono">
        XLarge Size, Plus Weight, Mono
      </Text>
    </div>
  )
}

```
