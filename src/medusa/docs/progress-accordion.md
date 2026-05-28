# Progress Accordion

A set of expandable content panels, specifically designed for implementing multi-step tasks

```tsx
import { ProgressAccordion, Text } from "@medusajs/ui"

export default function ProgressAccordionDemo() {
  return (
    <div className="w-full px-4">
      <ProgressAccordion type="single">
        <ProgressAccordion.Item value="general">
          <ProgressAccordion.Header>General</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
        <ProgressAccordion.Item value="shipping">
          <ProgressAccordion.Header>Shipping</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
      </ProgressAccordion>
    </div>
  )
}

```

## Usage

***

```tsx
import { ProgressAccordion } from "@medusajs/ui"
```

```tsx
<ProgressAccordion type="single">
  <ProgressAccordion.Item value="general">
    <ProgressAccordion.Header>
      General
    </ProgressAccordion.Header>
    <ProgressAccordion.Content>
       {/* Content */}
    </ProgressAccordion.Content>
  </ProgressAccordion.Item>
  <ProgressAccordion.Item value="shipping">
    <ProgressAccordion.Header>
      Shipping
    </ProgressAccordion.Header>
    <ProgressAccordion.Content>
        {/* Content */}
    </ProgressAccordion.Content>
  </ProgressAccordion.Item>
</ProgressAccordion>
```

## API Reference

***

### ProgressAccordion Props

This component is based on the \[Radix UI Accordion]\(https://radix-ui.com/primitives/docs/components/accordion) primitves.



### ProgressAccordion.Header Props

- status: (union) The current status. Default: "not-started"

## Examples

***

### Single

```tsx
import { ProgressAccordion, Text } from "@medusajs/ui"

export default function ProgressAccordionSingle() {
  return (
    <div className="w-full px-4">
      <ProgressAccordion type="single">
        <ProgressAccordion.Item value="general">
          <ProgressAccordion.Header>General</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
        <ProgressAccordion.Item value="shipping">
          <ProgressAccordion.Header>Shipping</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
      </ProgressAccordion>
    </div>
  )
}

```

### Multiple

```tsx
import { ProgressAccordion, Text } from "@medusajs/ui"

export default function ProgressAccordionSingle() {
  return (
    <div className="w-full px-4">
      <ProgressAccordion type="multiple">
        <ProgressAccordion.Item value="general">
          <ProgressAccordion.Header>General</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
        <ProgressAccordion.Item value="shipping">
          <ProgressAccordion.Header>Shipping</ProgressAccordion.Header>
          <ProgressAccordion.Content>
            <div className="pb-6">
              <Text size="small">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                ornare, tortor nec commodo ultrices, diam leo porttitor eros,
                eget ultricies mauris nisl nec nisl. Donec quis magna euismod,
                lacinia ipsum id, varius velit.
              </Text>
            </div>
          </ProgressAccordion.Content>
        </ProgressAccordion.Item>
      </ProgressAccordion>
    </div>
  )
}

```
