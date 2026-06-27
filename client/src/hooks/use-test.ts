import { useQuery } from "@tanstack/react-query"

export function useTest() {
  return useQuery({ queryKey: ["test"], queryFn: () => Promise.resolve("ok") })
}
