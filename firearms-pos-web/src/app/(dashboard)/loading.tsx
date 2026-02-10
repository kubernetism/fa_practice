import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
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
