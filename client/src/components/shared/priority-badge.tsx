import { cn } from "@/lib/utils"
import { PRIORITY_COLOR, PRIORITY_LABEL_FR } from "@/lib/constants"

type Priority = keyof typeof PRIORITY_LABEL_FR

export function PriorityBadge({
	priority,
	className,
}: {
	priority: Priority | null | undefined
	className?: string
}) {
	if (!priority) return null
	return (
		<span
			className={cn(
				"inline-flex items-center rounded px-2 py-0.5 text-xs font-medium",
				PRIORITY_COLOR[priority],
				className,
			)}
		>
			{PRIORITY_LABEL_FR[priority]}
		</span>
	)
}
