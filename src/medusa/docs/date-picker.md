# Date Picker

A date picker component with range and presets.

```tsx
import { DatePicker } from "@medusajs/ui"

export default function DatePickerDemo() {
  return (
    <div className="w-[250px]">
      <DatePicker />
    </div>
  )
}

```

## Usage

***

```tsx
import { DatePicker } from "@medusajs/ui"
```

```tsx
<DatePicker />
```

## API Reference

***

### DatePicker Props

- aria-describedby: (string) Identifies the element (or elements) that describes the object.
- aria-details: (string) Identifies the element (or elements) that provide a detailed, extended description for the object.
- aria-label: (string) Defines a string value that labels the current element.
- aria-labelledby: (string) Identifies the element (or elements) that labels the current element.
- autoFocus: (boolean) Whether the element should receive focus on render.
- defaultOpen: (boolean) Whether the overlay is open by default (uncontrolled).
- description: (ReactNode) A description for the field. Provides a hint such as specific requirements for what to choose.
- errorMessage: (union) An error message for the field.
- hideTimeZone: (boolean) Whether to hide the time zone abbreviation.
- hourCycle: (union) Whether to display the time in 12 or 24 hour format. By default, this is determined by the user's locale.
- id: (string) The element's unique identifier. See \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/HTML/Global\_attributes/id).
- isDisabled: (boolean) Whether the input is disabled.
- isInvalid: (boolean) Whether the input value is invalid.
- isOpen: (boolean) Whether the overlay is open by default (controlled).
- isReadOnly: (boolean) Whether the input can be selected but not changed by the user.
- isRequired: (boolean) Whether user input is required on the input before form submission.
- label: (ReactNode) The content to display as the label.
- name: (string) The name of the input element, used when submitting an HTML form. See \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname).
- onBlur: (signature) Handler that is called when the element loses focus.
- onFocus: (signature) Handler that is called when the element receives focus.
- onFocusChange: (signature) Handler that is called when the element's focus status changes.
- onKeyDown: (signature) Handler that is called when a key is pressed.
- onKeyUp: (signature) Handler that is called when a key is released.
- onOpenChange: (signature) Handler that is called when the overlay's open state changes.
- pageBehavior: (PageBehavior) Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration.
- placeholderValue: (union) A placeholder date that influences the format of the placeholder shown when no value is selected. Defaults to today's date at midnight.
- shouldForceLeadingZeros: (boolean) Whether to always show leading zeros in the month, day, and hour fields.
  By default, this is determined by the user's locale.
- validate: (signature) A function that returns an error message if a given value is invalid.
  Validation errors are displayed to the user when the form is submitted
  if \`validationBehavior="native"\`. For realtime validation, use the \`isInvalid\`
  prop instead.
- validationBehavior: (union) Whether to use native HTML form validation to prevent form submission
  when the value is missing or invalid, or mark the field as required
  or invalid via ARIA.

## Examples

***

### Controlled Date Picker

Manage and store the value of the date picker in a state variable for controlled behavior. This is also useful for form integration.

```tsx
"use client"

import { DatePicker } from "@medusajs/ui"
import { useState } from "react"

export default function DatePickerControlled() {
  const [date, setDate] = useState<Date | null>(new Date())

  return (
    <div className="space-y-4 w-[300px]">
      <DatePicker
        value={date}
        onChange={setDate}
        aria-label="Select a date"
      />
      <div className="text-ui-fg-subtle text-ui-body-small">
        Selected date: {date ? date.toLocaleDateString() : "None"}
      </div>
    </div>
  )
}

```

### Date Picker With Time

Enable time selection with different granularity levels for precise scheduling.

```tsx
"use client"

import { DatePicker } from "@medusajs/ui"

export default function DatePickerWithTime() {
  return (
    <div className="w-[300px]">
      <DatePicker
        granularity="minute"
        defaultValue={new Date()}
        aria-label="Select date and time"
      />
    </div>
  )
}

```

### Min/Max Values

Restrict date selection to a specific range by setting minimum and maximum values.

In the example below, you can only select dates within the next 30 days. Dates outside the range are disabled.

```tsx
"use client"

import { DatePicker } from "@medusajs/ui"

export default function DatePickerMinMax() {
  const today = new Date()
  const maxDate = new Date()
  maxDate.setDate(today.getDate() + 30) // 30 days from today

  return (
    <div className="w-[300px]">
      <DatePicker
        minValue={today}
        maxValue={maxDate}
        aria-label="Select a date within the next 30 days"
      />
    </div>
  )
}

```

### Disabled Dates

Disable specific dates like weekends and holidays to prevent selection of unavailable dates.

The example below disables weekends and holidays like Christmas.

```tsx
"use client"

import { DatePicker } from "@medusajs/ui"

export default function DatePickerBusinessHours() {
  return (
    <div className="w-[300px]">
      <DatePicker
        granularity="hour"
        defaultValue={new Date()}
        aria-label="Select date and hour for business scheduling"
        isDateUnavailable={(date) => {
          // Disable weekends and holidays
          const day = date.getDay()
          const isWeekend = day === 0 || day === 6
          
          // Example: Disable specific holiday (Christmas)
          const isChristmas = date.getMonth() === 11 && date.getDate() === 25
          
          return isWeekend || isChristmas
        }}
      />
    </div>
  )
}

```

### Granularity Options

Different levels of time precision from date-only to second-precision selection.

```tsx
"use client"

import { DatePicker } from "@medusajs/ui"

export default function DatePickerGranularity() {
  const defaultDate = new Date()

  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-2">
        <div className="text-ui-fg-base text-ui-body-small font-medium">Date Only</div>
        <DatePicker
          granularity="day"
          defaultValue={defaultDate}
          aria-label="Select day only"
        />
      </div>
      
      <div className="space-y-2">
        <div className="text-ui-fg-base text-ui-body-small font-medium">Date and Time with Hour Precision</div>
        <DatePicker
          granularity="hour"
          defaultValue={defaultDate}
          aria-label="Select date and hour"
        />
      </div>
      
      <div className="space-y-2">
        <div className="text-ui-fg-base text-ui-body-small font-medium">Date and Time with Minute Precision</div>
        <DatePicker
          granularity="minute"
          defaultValue={defaultDate}
          aria-label="Select date and time with minutes"
        />
      </div>
      
      <div className="space-y-2">
        <div className="text-ui-fg-base text-ui-body-small font-medium">Date and Time with Second Precision</div>
        <DatePicker
          granularity="second"
          defaultValue={defaultDate}
          aria-label="Select date and time with seconds"
        />
      </div>
    </div>
  )
}

```

### Form Integration

The following example shows how to use the date picker in a form, with simulated form submission.

```tsx
"use client"

import { DatePicker, Button, Label } from "@medusajs/ui"
import { useState } from "react"

export default function DatePickerForm() {
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [reminderDate, setReminderDate] = useState<Date | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    // Here you would typically send data to your API
    setTimeout(() => setSubmitted(false), 5000)
  }

  const isFormValid = eventDate && reminderDate

  return (
    <div className="p-6 max-w-md border border-ui-border-base rounded-lg bg-ui-bg-base">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-ui-fg-base font-medium">Schedule Event</h3>
          <p className="text-ui-fg-subtle text-ui-body-small">
            Set up your event and reminder dates
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-date">Event Date & Time</Label>
            <DatePicker
              id="event-date"
              value={eventDate}
              onChange={setEventDate}
              minValue={new Date()}
              aria-label="Select event date and time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-date">Reminder Date</Label>
            <DatePicker
              id="reminder-date"
              value={reminderDate}
              onChange={setReminderDate}
              minValue={new Date()}
              maxValue={eventDate || undefined}
              aria-label="Select reminder date"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={!isFormValid || submitted}
          className="w-full"
        >
          {submitted ? "Event Scheduled!" : "Schedule Event"}
        </Button>
      </form>

      {submitted && (
        <div className="mt-4 text-ui-fg-subtle text-ui-body-small">
          Event scheduled for {eventDate?.toLocaleString()} with a reminder on {reminderDate?.toLocaleDateString()}.
        </div>
      )}
    </div>
  )
}

```
