# Heading

Text component used for page titles and other headers

```tsx
import { Heading } from "@medusajs/ui"

export default function HeadingDemo() {
  return (
    <div className="flex flex-col items-center">
      <Heading level="h1">This is an H1 heading</Heading>
      <Heading level="h2">This is an H2 heading</Heading>
      <Heading level="h3">This is an H3 heading</Heading>
    </div>
  )
}

```

## Usage

***

```tsx
import { Heading } from "@medusajs/ui"
```

```tsx
<Heading>A Title</Heading>
```

## API Reference

***

### Heading Props

This component is based on the heading element (\`h1\`, \`h2\`, etc...) depeneding on the specified level
and supports all of its props

- level: (union) The heading level which specifies which heading element is used. Default: "h1"
