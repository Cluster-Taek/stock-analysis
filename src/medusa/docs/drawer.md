# Drawer

A triggerable drawer that overlaps whatever page it's on.

```tsx
import { Button, Drawer, Text } from "@medusajs/ui"

export default function DrawerDemo() {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Edit Variant</Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Edit Variant</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="p-4">
          <Text>This is where you edit the variant&apos;s details</Text>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>
          <Button>Save</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

```

## Usage

***

```tsx
import { Drawer } from "@medusajs/ui"
```

```tsx
<Drawer>
  <Drawer.Trigger>Trigger</Drawer.Trigger>
  <Drawer.Content>
    <Drawer.Header>
      <Drawer.Title>Drawer Title</Drawer.Title>
    </Drawer.Header>
    <Drawer.Body>Body</Drawer.Body>
    <Drawer.Footer>Footer</Drawer.Footer>
  </Drawer.Content>
</Drawer>
```

## API Reference

***

### Drawer Props

This component is based on the \[Radix UI Dialog]\(https://www.radix-ui.com/primitives/docs/components/dialog) primitives.



### Drawer.Trigger Props

This component is used to create the trigger button that opens the drawer.
It accepts props from the \[Radix UI Dialog Trigger]\(https://www.radix-ui.com/primitives/docs/components/dialog#trigger) component.



### Drawer.Content Props

This component wraps the content of the drawer.
It accepts props from the \[Radix UI Dialog Content]\(https://www.radix-ui.com/primitives/docs/components/dialog#content) component.

- overlayProps: (ReactComponentPropsWithoutRef) Props for the overlay component.
  It accepts props from the \[Radix UI Dialog Overlay]\(https://www.radix-ui.com/primitives/docs/components/dialog#overlay) component.
- portalProps: (ReactComponentPropsWithoutRef) Props for the portal component that wraps the drawer content.
  It accepts props from the \[Radix UI Dialog Portal]\(https://www.radix-ui.com/primitives/docs/components/dialog#portal) component.

### Drawer.Header Props

This component is used to wrap the header content of the drawer.
This component is based on the \`div\` element and supports all of its props.



### Drawer.Title Props

This component adds an accessible title to the drawer.
It accepts props from the \[Radix UI Dialog Title]\(https://www.radix-ui.com/primitives/docs/components/dialog#title) component.



### Drawer.Body Props

This component is used to wrap the body content of the drawer.
This component is based on the \`div\` element and supports all of its props



### Drawer.Footer Props

This component is used to wrap the footer content of the drawer.
This component is based on the \`div\` element and supports all of its props.

