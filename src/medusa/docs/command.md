# Command

Renders an unhighlighted code block, useful for one-liners or API Routes

```tsx
import { Badge, Command } from "@medusajs/ui"

export default function CommandDemo() {
  return (
    <div className="w-full">
      <Command>
        <Badge color="green">Get</Badge>
        <code>localhost:9000/store/products</code>
        <Command.Copy
          content="localhost:9000/store/products"
          className="ml-auto"
        />
      </Command>
    </div>
  )
}

```

## Usage

***

```tsx
import { Command } from "@medusajs/ui"
```

```tsx
<Command>
  <code>yarn add @medusajs/ui</code>
</Command>
```

## API Reference

***

### Command Props

This component is based on the div element and supports all of its props



## Usage Outside Medusa Admin

***

If you're using the `Command` component in a project other than the Medusa Admin, make sure to include the `TooltipProvider` somewhere up in your component tree, as the `Command.Copy` component uses a [Tooltip](https://docs.medusajs.com/components/tooltip#usage-outside-medusa-admin):

```tsx
<TooltipProvider>
  <Command>
    <code>yarn add @medusajs/ui</code>
    <Command.Copy
      content="yarn add @medusajs/ui"
      className="ml-auto"
    />
  </Command>
</TooltipProvider>
```
