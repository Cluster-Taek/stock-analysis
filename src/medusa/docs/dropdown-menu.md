# Dropdown Menu

Displays a menu to the user—such as a set of actions or functions—triggered by a button.

```tsx
import { EllipsisHorizontal, PencilSquare, Plus, Trash } from "@medusajs/icons"
import { DropdownMenu, IconButton } from "@medusajs/ui"

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton>
          <EllipsisHorizontal />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item className="gap-x-2">
          <PencilSquare className="text-ui-fg-subtle" />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item className="gap-x-2">
          <Plus className="text-ui-fg-subtle" />
          Add
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="gap-x-2">
          <Trash className="text-ui-fg-subtle" />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

```

## Usage

***

```tsx
import { DropdownMenu } from "@medusajs/ui"
```

```tsx
<DropdownMenu>
  <DropdownMenu.Trigger>Trigger</DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>Edit</DropdownMenu.Item>
    <DropdownMenu.Item>Add</DropdownMenu.Item>
    <DropdownMenu.Item>Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>
```

## API Reference

***

### DropdownMenu Props

This component is based on the \[Radix UI Dropdown Menu]\(https://www.radix-ui.com/primitives/docs/components/dropdown-menu) primitive.



### DropdownMenu.Shortcut Props

This component is based on the \`span\` element and supports all of its props



### DropdownMenu.Hint Props

This component is based on the \`span\` element and supports all of its props



## Examples

***

### Sorting

Implementing collection sorting choices using a Dropdown Menu:

```tsx
import { EllipsisHorizontal } from "@medusajs/icons"
import { DropdownMenu, IconButton } from "@medusajs/ui"
import React from "react"

type SortingState = "asc" | "desc" | "alpha" | "alpha-reverse" | "none"

export default function DropdownMenuSorting() {
  const [sort, setSort] = React.useState<SortingState>("none")

  return (
    <div className="flex flex-col items-center gap-y-2">
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <IconButton>
            <EllipsisHorizontal />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content className="w-[300px]">
          <DropdownMenu.RadioGroup
            value={sort}
            onValueChange={(v) => setSort(v as SortingState)}
          >
            <DropdownMenu.RadioItem value="none">
              No Sorting
            </DropdownMenu.RadioItem>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioItem value="alpha">
              Alphabetical
              <DropdownMenu.Hint>A-Z</DropdownMenu.Hint>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="alpha-reverse">
              Reverse Alphabetical
              <DropdownMenu.Hint>Z-A</DropdownMenu.Hint>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="asc">
              Created At - Ascending
              <DropdownMenu.Hint>1 - 30</DropdownMenu.Hint>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem value="desc">
              Created At - Descending
              <DropdownMenu.Hint>30 - 1</DropdownMenu.Hint>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu>
      <div>
        <pre className=" text-sm">Sorting: {sort}</pre>
      </div>
    </div>
  )
}

```
