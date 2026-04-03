import {
  createResourceService,
  listResourcesService,
} from '@/lib/resources/services'
import {
  buildCreatedResourceResponse,
  createAdminResourceCollectionHandlers,
} from './route-support'

const handlers = createAdminResourceCollectionHandlers({
  listResources: listResourcesService,
  createResource: createResourceService,
  buildCreatedResponse: (resource) => buildCreatedResourceResponse(resource as never),
})

export const { GET, POST } = handlers
