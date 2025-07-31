# Command Bar

Display a command bar with a list of commands

```tsx
import { Checkbox, CommandBar, Label, Text } from "@medusajs/ui"
import * as React from "react"

export default function CommandBarDemo() {
  const [selected, setSelected] = React.useState<boolean>(false)

  return (
    <div className="flex justify-center gap-y-2 flex-col">
      <div className="flex items-center gap-x-2">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) =>
            setSelected(checked === true ? true : false)
          }
        />
        <Label>Item One</Label>
      </div>
      <div><Text size="small" className="text-ui-fg-muted">Check the box to view the command bar</Text></div>
      <CommandBar open={selected}>
        <CommandBar.Bar>
          <CommandBar.Value>1 selected</CommandBar.Value>
          <CommandBar.Seperator />
          <CommandBar.Command
            action={() => {
              alert("Delete")
            }}
            label="Delete"
            shortcut="d"
          />
          <CommandBar.Seperator />
          <CommandBar.Command
            action={() => {
              alert("Edit")
            }}
            label="Edit"
            shortcut="e"
          />
        </CommandBar.Bar>
      </CommandBar>
    </div>
  )
}

```

## Usage

***

```tsx
import { CommandBar } from "@medusajs/ui"
```

```tsx
<CommandBar open={open}>
  <CommandBar.Bar>
    <CommandBar.Value>{count} selected</CommandBar.Value>
    <CommandBar.Seperator />
    <CommandBar.Command
      action={onDelete}
      label="Delete"
      shortcut="d"
    />
    <CommandBar.Seperator />
    <CommandBar.Command
      action={onEdit}
      label="Edit"
      shortcut="e"
    />
  </CommandBar.Bar>
</CommandBar>
```

## API Reference

***

### CommandBar Props

The root component of the command bar. This component manages the state of the command bar.

- open: (boolean) Whether to open (show) the command bar. Default: false
- onOpenChange: (signature) Specify a function to handle the change of \`open\`'s value.
- defaultOpen: (boolean) Whether the command bar is open by default. Default: false
- disableAutoFocus: (boolean) Whether to disable focusing automatically on the command bar when it's opened. Default: true

### CommandBar.Bar Props

The bar component of the command bar. This component is used to display the commands.



### CommandBar.Value Props

The value component of the command bar. This component is used to display a value,
such as the number of selected items which the commands will act on.



### CommandBar.Seperator Props

The seperator component of the command bar. This component is used to display a seperator between commands.



### CommandBar.Command Props

The command component of the command bar. This component is used to display a command, as well as registering the keyboad shortcut.

- action: (signature) The function to execute when the command is triggered.
- label: (string) The command's label.
- shortcut: (string) The command's shortcut
