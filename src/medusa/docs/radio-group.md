# Radio Group

A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time.

```tsx
import { Label, RadioGroup } from "@medusajs/ui"

export default function RadioGroupDemo() {
  return (
    <RadioGroup>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="1" id="radio_1" />
        <Label htmlFor="radio_1" weight="plus">
          Radio 1
        </Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="2" id="radio_2" />
        <Label htmlFor="radio_2" weight="plus">
          Radio 2
        </Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="3" id="radio_3" />
        <Label htmlFor="radio_3" weight="plus">
          Radio 3
        </Label>
      </div>
    </RadioGroup>
  )
}

```

## Usage

***

```tsx
import { RadioGroup } from "@medusajs/ui"
```

```tsx
<RadioGroup>
  <RadioGroup.Item value="1" id="radio_1" />
  <RadioGroup.Item value="2" id="radio_2" />
  <RadioGroup.Item value="3" id="radio_3" />
</RadioGroup>
```

## API Reference

***

### RadioGroup Props

This component is based on the \[Radix UI Radio Group]\(https://www.radix-ui.com/primitives/docs/components/radio-group) primitives.



## Examples

***

### With Descriptions

```tsx
import { Label, RadioGroup, Text } from "@medusajs/ui"

export default function RadioGroupDescriptions() {
  return (
    <RadioGroup>
      <div className="flex items-start gap-x-3">
        <RadioGroup.Item value="1" id="radio_1_descriptions" />
        <div className="flex flex-col gap-y-0.5">
          <Label htmlFor="radio_1_descriptions" weight="plus">
            Radio 1
          </Label>
          <Text className="text-ui-fg-subtle">
            The quick brown fox jumps over the lazy dog.
          </Text>
        </div>
      </div>
      <div className="flex items-start gap-x-3">
        <RadioGroup.Item value="2" id="radio_2_descriptions" />
        <div className="flex flex-col gap-y-0.5">
          <Label htmlFor="radio_2_descriptions" weight="plus">
            Radio 2
          </Label>
          <Text className="text-ui-fg-subtle">
            The quick brown fox jumps over the lazy dog.
          </Text>
        </div>
      </div>
      <div className="flex items-start gap-x-3">
        <RadioGroup.Item value="3" id="radio_3_descriptions" />
        <div className="flex flex-col gap-y-0.5">
          <Label htmlFor="radio_3_descriptions" weight="plus">
            Radio 3
          </Label>
          <Text className="text-ui-fg-subtle">
            The quick brown fox jumps over the lazy dog.
          </Text>
        </div>
      </div>
    </RadioGroup>
  )
}

```

### With a disabled item

```tsx
import { Label, RadioGroup } from "@medusajs/ui"

export default function RadioGroupDisabled() {
  return (
    <RadioGroup>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="1" id="radio_1_disabled" />
        <Label htmlFor="radio_1_disabled" weight="plus">
          Radio 1
        </Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="2" id="radio_2_disabled" />
        <Label htmlFor="radio_2_disabled" weight="plus">
          Radio 2
        </Label>
      </div>
      <div className="flex items-center gap-x-3">
        <RadioGroup.Item value="3" id="radio_3_disabled" disabled={true} />
        <Label htmlFor="radio_3_disabled" weight="plus">
          Radio 3
        </Label>
      </div>
    </RadioGroup>
  )
}

```
