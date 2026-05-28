# Table

A Table component for displaying data.

If you're looking to add a table in your Medusa Admin Extensions with features like pagination and filters, refer to the [DataTable](https://docs.medusajs.com/components/data-table) component instead.

```tsx
import { Table } from "@medusajs/ui"

type Order = {
  id: string
  displayId: number
  customer: string
  email: string
  amount: number
  currency: string
}

const fakeData: Order[] = [
  {
    id: "order_6782",
    displayId: 86078,
    customer: "Jill Miller",
    email: "32690@gmail.com",
    amount: 493,
    currency: "EUR",
  },
  {
    id: "order_46487",
    displayId: 42845,
    customer: "Sarah Garcia",
    email: "86379@gmail.com",
    amount: 113,
    currency: "JPY",
  },
  {
    id: "order_8169",
    displayId: 39129,
    customer: "Josef Smith",
    email: "89383@gmail.com",
    amount: 43,
    currency: "USD",
  },
  {
    id: "order_67883",
    displayId: 5548,
    customer: "Elvis Jones",
    email: "52860@gmail.com",
    amount: 840,
    currency: "GBP",
  },
  {
    id: "order_61121",
    displayId: 87668,
    customer: "Charles Rodriguez",
    email: "45675@gmail.com",
    amount: 304,
    currency: "GBP",
  },
]

export default function TableDemo() {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>#</Table.HeaderCell>
          <Table.HeaderCell>Customer</Table.HeaderCell>
          <Table.HeaderCell>Email</Table.HeaderCell>
          <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {fakeData.map((order) => {
          return (
            <Table.Row
              key={order.id}
              className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
            >
              <Table.Cell>{order.displayId}</Table.Cell>
              <Table.Cell>{order.customer}</Table.Cell>
              <Table.Cell>{order.email}</Table.Cell>
              <Table.Cell className="text-right">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: order.currency,
                }).format(order.amount)}
              </Table.Cell>
              <Table.Cell className="text-ui-fg-muted">
                {order.currency}
              </Table.Cell>
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  )
}

```

## Usage

***

```tsx
import { Table } from "@medusajs/ui"
```

```tsx
<Table>
  <Table.Header>
    <Table.Row>
      <Table.HeaderCell>#</Table.HeaderCell>
      <Table.HeaderCell>Customer</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>1</Table.Cell>
      <Table.Cell>Emil Larsson</Table.Cell>
      <Table.Cell>emil2738@gmail.com</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```

## API Reference

***

### Table Props

This component is based on the table element and its various children:

\- \`Table\`: \`table\`
\- \`Table.Header\`: \`thead\`
\- \`Table.Row\`: \`tr\`
\- \`Table.HeaderCell\`: \`th\`
\- \`Table.Body\`: \`tbody\`
\- \`Table.Cell\`: \`td\`

Each component supports the props or attributes of its equivalent HTML element.



### Table.Pagination Props

This component is based on the \`div\` element and supports all of its props

- count: (number) The total number of items.
- pageSize: (number) The number of items per page.
- pageIndex: (number) The current page index.
- pageCount: (number) The total number of pages.
- canPreviousPage: (boolean) Whether there's a previous page that can be navigated to.
- canNextPage: (boolean) Whether there's a next page that can be navigated to.
- translations: (signature) An optional object of words to use in the pagination component.
  Use this to override the default words, or translate them into another language. Default: \{
  &#x20; of: "of",
  &#x20; results: "results",
  &#x20; pages: "pages",
  &#x20; prev: "Prev",
  &#x20; next: "Next",
  }
- previousPage: (signature) A function that handles navigating to the previous page.
  This function should handle retrieving data for the previous page.
- nextPage: (signature) A function that handles navigating to the next page.
  This function should handle retrieving data for the next page.

## Examples

***

### Table with Pagination

```tsx
import { Table } from "@medusajs/ui"
import { useMemo, useState } from "react"

type Order = {
  id: string
  displayId: number
  customer: string
  email: string
  amount: number
  currency: string
}

export default function TableDemo() {
  const fakeData: Order[] = useMemo(
    () => [
      {
        id: "order_6782",
        displayId: 86078,
        customer: "Jill Miller",
        email: "32690@gmail.com",
        amount: 493,
        currency: "EUR",
      },
      {
        id: "order_46487",
        displayId: 42845,
        customer: "Sarah Garcia",
        email: "86379@gmail.com",
        amount: 113,
        currency: "JPY",
      },
      {
        id: "order_8169",
        displayId: 39129,
        customer: "Josef Smith",
        email: "89383@gmail.com",
        amount: 43,
        currency: "USD",
      },
      {
        id: "order_67883",
        displayId: 5548,
        customer: "Elvis Jones",
        email: "52860@gmail.com",
        amount: 840,
        currency: "GBP",
      },
      {
        id: "order_61121",
        displayId: 87668,
        customer: "Charles Rodriguez",
        email: "45675@gmail.com",
        amount: 304,
        currency: "GBP",
      },
    ],
    []
  )
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 3
  const pageCount = Math.ceil(fakeData.length / pageSize)
  const canNextPage = useMemo(
    () => currentPage < pageCount - 1,
    [currentPage, pageCount]
  )
  const canPreviousPage = useMemo(() => currentPage - 1 >= 0, [currentPage])

  const nextPage = () => {
    if (canNextPage) {
      setCurrentPage(currentPage + 1)
    }
  }

  const previousPage = () => {
    if (canPreviousPage) {
      setCurrentPage(currentPage - 1)
    }
  }

  const currentOrders = useMemo(() => {
    const offset = currentPage * pageSize
    const limit = Math.min(offset + pageSize, fakeData.length)

    return fakeData.slice(offset, limit)
  }, [currentPage, pageSize, fakeData])

  return (
    <div className="flex gap-1 flex-col">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>#</Table.HeaderCell>
            <Table.HeaderCell>Customer</Table.HeaderCell>
            <Table.HeaderCell>Email</Table.HeaderCell>
            <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentOrders.map((order) => {
            return (
              <Table.Row
                key={order.id}
                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
              >
                <Table.Cell>{order.displayId}</Table.Cell>
                <Table.Cell>{order.customer}</Table.Cell>
                <Table.Cell>{order.email}</Table.Cell>
                <Table.Cell className="text-right">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: order.currency,
                  }).format(order.amount)}
                </Table.Cell>
                <Table.Cell className="text-ui-fg-muted">
                  {order.currency}
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      <Table.Pagination
        count={fakeData.length}
        pageSize={pageSize}
        pageIndex={currentPage}
        pageCount={fakeData.length}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        previousPage={previousPage}
        nextPage={nextPage}
      />
    </div>
  )
}

```
