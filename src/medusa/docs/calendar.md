# Calendar

A calendar component that allows picking of a single date or a range of dates.

```tsx
import { Calendar } from "@medusajs/ui"
import * as React from "react"

export default function CalendarDemo() {
  const [date, setDate] = React.useState<Date | null>()

  return <Calendar value={date} onChange={setDate} />
}

```

## Usage

***

```tsx
import { Calendar } from "@medusajs/ui"
```

```tsx
<Calendar />
```

## API Reference

***

### Calendar Props

Calendar component used to select a date.
Its props are based on \[React Aria Calendar]\(https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).

- autoFocus: (boolean) Whether to automatically focus the calendar when it mounts.
- defaultFocusedValue: (DateValue) The date that is focused when the calendar first mounts (uncountrolled).
- errorMessage: (ReactNode) An error message to display when the selected value is invalid.
- focusedValue: (DateValue) Controls the currently focused date within the calendar.
- isDisabled: (boolean) Whether the calendar is disabled.
- isInvalid: (boolean) Whether the current selection is invalid according to application logic.
- isReadOnly: (boolean) Whether the calendar value is immutable.
- onFocusChange: (signature) Handler that is called when the focused date changes.
- pageBehavior: (PageBehavior) Controls the behavior of paging. Pagination either works by advancing the visible page by visibleDuration (default) or one unit of visibleDuration.
- validationState: (ValidationState) Whether the current selection is valid or invalid according to application logic.
