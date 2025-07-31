# Focus Modal

A modal component that spans the whole screen

```tsx
import { Button, FocusModal, Heading, Input, Label, Text } from "@medusajs/ui"

export default function FocusModalDemo() {
  return (
    <FocusModal>
      <FocusModal.Trigger asChild>
        <Button>Edit Variant</Button>
      </FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button>Save</Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div className="flex flex-col gap-y-1">
              <Heading>Create API key</Heading>
              <Text className="text-ui-fg-subtle">
                Create and manage API keys. You can create multiple keys to
                organize your applications.
              </Text>
            </div>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="key_name" className="text-ui-fg-subtle">
                Key name
              </Label>
              <Input id="key_name" placeholder="my_app" />
            </div>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}

```

## Usage

***

```tsx
import { FocusModal } from "@medusajs/ui"
```

```tsx
<FocusModal>
  <FocusModal.Trigger>Trigger</FocusModal.Trigger>
  <FocusModal.Content>
    <FocusModal.Header>Title</FocusModal.Header>
    <FocusModal.Body>Content</FocusModal.Body>
  </FocusModal.Content>
</FocusModal>
```

### API Reference

***

### FocusModal Props

This component is based on the \[Radix UI Dialog]\(https://www.radix-ui.com/primitives/docs/components/dialog) primitives.

- defaultOpen: (boolean) Whether the modal is opened by default.
- open: (boolean) Whether the modal is opened.
- onOpenChange: (signature) A function to handle when the modal is opened or closed.

### FocusModal.Trigger Props

This component is used to create the trigger button that opens the modal.
It accepts props from the \[Radix UI Dialog Trigger]\(https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.



### FocusModal.Content Props

This component wraps the content of the modal.
It accepts props from the \[Radix UI Dialog Content]\(https://www.radix-ui.com/primitives/docs/components/dialog#content) component.



### FocusModal.Header Props

This component is used to wrap the header content of the modal.
This component is based on the \`div\` element and supports all of its props



### FocusModal.Body Props

This component is used to wrap the body content of the modal.
This component is based on the \`div\` element and supports all of its props



### FocusModal.Footer Props

This component is used to wrap the footer content of the modal.
This component is based on the \`div\` element and supports all of its props



## Example: Control Open State

***

```tsx
import { useState } from "react"

const MyModal = () => {
  const [open, setOpen] = useState(false)

  return (
    <FocusModal 
      open={open} 
      onOpenChange={setOpen}
    >
      <FocusModal.Trigger>Trigger</FocusModal.Trigger>
      <FocusModal.Content>
        <FocusModal.Header>Title</FocusModal.Header>
        <FocusModal.Body>Content</FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
```
