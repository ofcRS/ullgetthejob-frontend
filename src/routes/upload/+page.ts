import type { PageLoad } from './$types'
import { fetchModels } from '$lib/api/models.api'

export const load: PageLoad = async () => {
  const models = await fetchModels()
  return { models }
}


