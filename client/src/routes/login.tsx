import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/login")({
	component: LoginPage,
})

function LoginPage() {
	const navigate = useNavigate()
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsLoading(true)
		setError(null)
		const { error: err } = await authClient.signIn.username({ username, password })
		setIsLoading(false)
		if (err) {
			setError(err.message ?? "Identifiants invalides")
			return
		}
		await navigate({ to: "/" })
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
				<h1 className="text-2xl font-semibold text-foreground">Connexion</h1>
				<div className="space-y-2">
					<label htmlFor="username" className="text-sm font-medium">Identifiant</label>
					<input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className="w-full rounded border border-input bg-background px-3 py-2 text-sm" />
				</div>
				<div className="space-y-2">
					<label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
					<input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="w-full rounded border border-input bg-background px-3 py-2 text-sm" />
				</div>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<button type="submit" disabled={isLoading} className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
					{isLoading ? "Connexion..." : "Se connecter"}
				</button>
			</form>
		</div>
	)
}
