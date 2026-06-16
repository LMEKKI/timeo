import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useNavigate } from "@tanstack/react-router"
import { fetchJob, transitionJob } from "../services/api"
import { Button } from "@/components/ui/button"

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Planifié",
  EN_ROUTE: "En route",
  IN_PROGRESS: "En cours",
  PENDING_APPROVAL: "En attente d'approbation",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  EN_ROUTE: "bg-indigo-100 text-indigo-800",
  SCHEDULED: "bg-gray-100 text-gray-800",
}

const TRANSITION_BUTTONS: Record<string, { status: string; label: string }[]> = {
  SCHEDULED: [
    { status: "EN_ROUTE", label: "Démarrer la route" },
  ],
  EN_ROUTE: [
    { status: "IN_PROGRESS", label: "Commencer l'intervention" },
  ],
  IN_PROGRESS: [
    { status: "PENDING_APPROVAL", label: "Soumettre pour approbation" },
  ],
  PENDING_APPROVAL: [
    { status: "COMPLETED", label: "Terminer" },
  ],
}

export function JobDetailPage() {
  const { id } = useParams({ from: "/jobs/$id" })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState("")
  const [showCancelInput, setShowCancelInput] = useState(false)

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: () => fetchJob(id),
  })

  const mutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      transitionJob(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job", id] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      setShowCancelInput(false)
      setCancelReason("")
    },
  })

  if (isLoading) return <div className="p-4 text-center">Chargement...</div>
  if (!job) return <div className="p-4 text-center text-red-500">Intervention introuvable</div>

  const nextTransitions = TRANSITION_BUTTONS[job.status] || []
  const canCancel = job.status === "SCHEDULED" || job.status === "EN_ROUTE"

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate({ to: "/jobs" })} className="text-blue-600 mb-4 hover:underline">
        ← Retour aux interventions
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Intervention</h1>
          <p className="text-gray-500 text-sm font-mono">{job.id}</p>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[job.status] || ""}`}>
          {STATUS_LABELS[job.status] || job.status}
        </span>
      </div>

      <div className="border rounded-lg p-4 space-y-3 mb-6">
        <div>
          <span className="text-gray-500 text-sm">Planifié le :</span>
          <p className="font-medium">{new Date(job.scheduledStartAt).toLocaleString("fr-FR")}</p>
        </div>
        {job.version && (
          <div>
            <span className="text-gray-500 text-sm">Version :</span>
            <p className="font-medium">{job.version}</p>
          </div>
        )}
      </div>

      {nextTransitions.length > 0 && (
        <div className="space-y-3 mb-6">
          <h2 className="font-semibold text-lg">Actions</h2>
          {nextTransitions.map((t) => (
            <Button
              key={t.status}
              onClick={() => mutation.mutate({ status: t.status })}
              disabled={mutation.isPending}
              className="w-full"
            >
              {t.label}
            </Button>
          ))}
        </div>
      )}

      {canCancel && (
        <div className="mt-4">
          {!showCancelInput ? (
            <Button onClick={() => setShowCancelInput(true)} variant="destructive" className="w-full">
              Annuler l'intervention
            </Button>
          ) : (
            <div className="space-y-2 p-4 border rounded-lg bg-red-50">
              <p className="text-sm text-red-700 font-medium">Motif d'annulation (obligatoire) :</p>
              <input
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded border p-2"
                placeholder="Raison de l'annulation"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => mutation.mutate({ status: "CANCELLED", reason: cancelReason })}
                  disabled={!cancelReason.trim() || mutation.isPending}
                  variant="destructive"
                >
                  Confirmer l'annulation
                </Button>
                <Button onClick={() => { setShowCancelInput(false); setCancelReason("") }} variant="outline">
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {mutation.isError && (
        <p className="text-red-500 mt-4">Erreur : {(mutation.error as Error).message}</p>
      )}

      {mutation.isSuccess && !mutation.isPending && (
        <p className="text-green-600 mt-4">✓ Statut mis à jour avec succès</p>
      )}

      {(job.status === "COMPLETED" || job.status === "CANCELLED") && (
        <p className="text-gray-500 mt-8 text-center">Cette intervention est terminée.</p>
      )}
    </div>
  )
}
