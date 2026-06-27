import { cn } from "@/lib/utils"
import { STATUS_COLOR, STATUS_LABEL_FR } from "@/lib/constants"

type Status = keyof typeof STATUS_LABEL_FR

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
				STATUS_COLOR[status],
				className,
			)}
		>
			{STATUS_LABEL_FR[status]}
		</span>
	)
}
