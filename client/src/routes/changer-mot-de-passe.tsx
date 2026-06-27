import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export const Route = createFileRoute("/changer-mot-de-passe")({
	component: ChangePasswordPage,
})

function ChangePasswordPage() {
	const navigate = useNavigate()
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (newPassword !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas")
			return
		}
		if (newPassword.length < 8) {
			setError("Le mot de passe doit faire au moins 8 caractères")
			return
		}
		setIsLoading(true)
		setError(null)
		const { error: changeErr } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		})
		if (changeErr) {
			setIsLoading(false)
			setError(changeErr.message ?? "Erreur lors du changement")
			return
		}
		const clearRes = await fetch(
			`${import.meta.env.VITE_API_URL ?? "http://localhost:3000"}/api/auth-custom/me/clear-must-change`,
			{ method: "PATCH", credentials: "include" },
		)
		setIsLoading(false)
		if (!clearRes.ok) {
			setError("Mot de passe changé, mais erreur lors de la mise à jour du profil")
			return
		}
		await navigate({ to: "/" })
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
				<h1 className="text-2xl font-semibold">Changer mon mot de passe</h1>
				<p className="text-sm text-muted-foreground">
					Vous devez changer votre mot de passe provisoire avant de continuer.
				</p>
				<div className="space-y-2">
					<label htmlFor="current" className="text-sm font-medium">Mot de passe actuel</label>
					<input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full rounded border border-input bg-background px-3 py-2 text-sm" />
				</div>
				<div className="space-y-2">
					<label htmlFor="new" className="text-sm font-medium">Nouveau mot de passe</label>
					<input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="w-full rounded border border-input bg-background px-3 py-2 text-sm" />
				</div>
				<div className="space-y-2">
					<label htmlFor="confirm" className="text-sm font-medium">Confirmer</label>
					<input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="w-full rounded border border-input bg-background px-3 py-2 text-sm" />
				</div>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<button type="submit" disabled={isLoading} className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
					{isLoading ? "Changement..." : "Changer"}
				</button>
			</form>
		</div>
	)
}
