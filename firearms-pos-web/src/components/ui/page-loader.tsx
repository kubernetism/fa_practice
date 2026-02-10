import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export function PageLoader({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className ?? ''}`}>
      <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
        <Item variant="muted">
          <ItemMedia>
            <Spinner />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="line-clamp-1">Loading...</ItemTitle>
          </ItemContent>
        </Item>
      </div>
    </div>
  )
}

export function TableLoader({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-12">
        <div className="flex items-center justify-center">
          <div className="flex w-full max-w-xs flex-col gap-4 [--radius:1rem]">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">Loading...</ItemTitle>
              </ItemContent>
            </Item>
          </div>
        </div>
      </td>
    </tr>
  )
}
