import { Users } from "lucide-react"

export function MultiAssignBadge() {
	return (
		<span className="inline-flex items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
			<Users size={10} />
			Multi
		</span>
	)
}
