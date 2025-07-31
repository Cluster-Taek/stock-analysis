# Prompt

Displays a dialog triggered by a button

```tsx
import { Button, Prompt } from "@medusajs/ui"

export default function PromptDemo() {
  return (
    <Prompt>
      <Prompt.Trigger asChild>
        <Button>Open</Button>
      </Prompt.Trigger>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Delete something</Prompt.Title>
          <Prompt.Description>
            Are you sure? This cannot be undone.
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel>Cancel</Prompt.Cancel>
          <Prompt.Action>Delete</Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  )
}

```

## Usage

***

```tsx
import { Prompt } from "@medusajs/ui"
```

```tsx
<Prompt>
  <Prompt.Trigger>Trigger</Prompt.Trigger>
  <Prompt.Content>
    <Prompt.Header>
      <Prompt.Title>Title</Prompt.Title>
      <Prompt.Description>Description</Prompt.Description>
    </Prompt.Header>
    <Prompt.Footer>
      <Prompt.Cancel>Cancel</Prompt.Cancel>
      <Prompt.Action>Delete</Prompt.Action>
    </Prompt.Footer>
  </Prompt.Content>
</Prompt>
```

## API Reference

***

### Prompt Props

This component is based on the \[Radix UI Alert Dialog]\(https://www.radix-ui.com/primitives/docs/components/alert-dialog) primitives.

- variant: (union) The variant of the prompt. Default: "danger"

### Prompt.Header Props

This component is based on the \`div\` element and supports all of its props



### Prompt.Footer Props

This component is based on the \`div\` element and supports all of its props

