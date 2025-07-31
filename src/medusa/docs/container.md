# Container

A box used to organise content.

```tsx
import { Container } from "@medusajs/ui"

export default function ContainerDemo() {
  return <Container>Content</Container>
}

```

## Usage

***

```tsx
import { Container } from "@medusajs/ui"
```

```tsx
<Container>Container</Container>
```

## API Reference

***

### Container Props

This component is based on the \`div\` element and supports all of its props



## Examples

***

### In a layout

```tsx
import { Container, Heading } from "@medusajs/ui"

export default function ContainerLayout() {
  return (
    <div className="flex h-full w-full">
      <div className="border-ui-border-base w-full max-w-[216px] border-r p-4">
        <Heading level="h3">Menubar</Heading>
      </div>
      <div className="flex w-full flex-col gap-y-2 px-8 pb-8 pt-6">
        <Container>
          <Heading>Section 1</Heading>
        </Container>
        <Container>
          <Heading>Section 2</Heading>
        </Container>
        <Container>
          <Heading>Section 3</Heading>
        </Container>
      </div>
    </div>
  )
}

```
