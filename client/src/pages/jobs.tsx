import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { fetchJobs } from "../services/api"
import { Button } from "@/components/ui/button"

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  EN_ROUTE: "bg-indigo-100 text-indigo-800",
  SCHEDULED: "bg-gray-100 text-gray-800",
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Planifié",
  EN_ROUTE: "En route",
  IN_PROGRESS: "En cours",
  PENDING_APPROVAL: "En attente",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
}

export function JobsPage() {
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  })

  if (isLoading) return <div className="p-4 text-center">Chargement...</div>

  if (error) return (
    <div className="p-4 max-w-2xl mx-auto">
      <p className="text-red-500">Erreur : {(error as Error).message}</p>
    </div>
  )

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes interventions</h1>
        <Button onClick={() => {
          localStorage.removeItem("session_token")
          window.location.href = "/login"
        }} variant="outline" size="sm">
          Déconnexion
        </Button>
      </div>

      {!jobs?.length ? (
        <p className="text-gray-500 text-center py-8">Aucune intervention pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={"/jobs/$id"}
              params={{ id: job.id }}
              className="block p-4 rounded-lg border hover:bg-gray-50 transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{job.id}</span>
                <span className={`px-2 py-1 rounded text-sm font-medium ${STATUS_COLORS[job.status] || ""}`}>
                  {STATUS_LABELS[job.status] || job.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(job.scheduledStartAt).toLocaleString("fr-FR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
