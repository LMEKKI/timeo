import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/non-autorise')({
	component: NonAutorisePage,
})

function NonAutorisePage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4 text-foreground">
			<h1 className="text-2xl font-semibold">Accès refusé</h1>
			<p className="text-muted-foreground">Vous n'avez pas accès à cette page.</p>
			<Link to="/" className="text-primary hover:underline">
				Retour à l'accueil
			</Link>
		</div>
	)
}
