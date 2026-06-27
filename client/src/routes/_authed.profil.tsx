import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, LogOut, Save } from "lucide-react"
import { useState, type FormEvent } from "react"
import { authClient, useAuth } from "@/lib/auth-client"
import { AVAILABILITY_LABEL_FR } from "@/lib/constants"

export const Route = createFileRoute("/_authed/profil")({
	component: ProfilePage,
})

function ProfilePage() {
	const { user, signOut } = useAuth()
	const navigate = useNavigate()
	const [currentPassword, setCurrentPassword] = useState("")
	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const handleChangePassword = async (e: FormEvent) => {
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
		const { error: err } = await authClient.changePassword({
			currentPassword,
			newPassword,
			revokeOtherSessions: true,
		})
		setIsLoading(false)
		if (err) {
			setError(err.message ?? "Erreur")
			return
		}
		setSuccess(true)
		setCurrentPassword("")
		setNewPassword("")
		setConfirmPassword("")
	}

	const handleSignOut = async () => {
		await signOut()
		await navigate({ to: "/login" })
	}

	if (!user) return null
	const isTech = user.role === "tech"
	const availability = isTech
		? ((user as { availabilityStatus?: keyof typeof AVAILABILITY_LABEL_FR }).availabilityStatus ?? "available")
		: null

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-6">
			<Link
				to="/"
				className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft size={14} />
				Retour
			</Link>

			<h1 className="text-2xl font-semibold">Mon profil</h1>

			<div className="rounded-lg border border-border bg-card p-4">
				<h2 className="mb-3 font-medium">Informations</h2>
				<div className="space-y-2 text-sm">
					<p>
						<span className="text-muted-foreground">Nom :</span> {user.name}
					</p>
					<p>
						<span className="text-muted-foreground">Identifiant :</span> {user.username}
					</p>
					{user.email && (
						<p>
							<span className="text-muted-foreground">Email :</span> {user.email}
						</p>
					)}
					<p>
						<span className="text-muted-foreground">Rôle :</span>{" "}
						{user.role === "chef" ? "Chef" : "Technicien"}
					</p>
					{availability && (
						<p>
							<span className="text-muted-foreground">Disponibilité :</span>{" "}
							{AVAILABILITY_LABEL_FR[availability]}
						</p>
					)}
				</div>
			</div>

			<form
				onSubmit={handleChangePassword}
				className="rounded-lg border border-border bg-card p-4"
			>
				<h2 className="mb-3 font-medium">Changer le mot de passe</h2>
				<div className="space-y-3">
					<div>
						<label htmlFor="currentPassword" className="text-sm font-medium">
							Mot de passe actuel
						</label>
						<input
							id="currentPassword"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							required
							className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label htmlFor="newPassword" className="text-sm font-medium">
							Nouveau mot de passe
						</label>
						<input
							id="newPassword"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							minLength={8}
							required
							className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					<div>
						<label htmlFor="confirmPassword" className="text-sm font-medium">
							Confirmer
						</label>
						<input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							minLength={8}
							required
							className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm"
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					{success && <p className="text-sm text-success">Mot de passe changé.</p>}
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
					>
						<Save size={16} />
						{isLoading ? "Changement..." : "Changer"}
					</button>
				</div>
			</form>

			<button
				type="button"
				onClick={handleSignOut}
				className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
			>
				<LogOut size={14} />
				Se déconnecter
			</button>
		</div>
	)
}
