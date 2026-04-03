import {
  getResourceAccessService,
  grantAccessService,
} from '@/lib/resources/services/admin/access-service'
import { createAdminResourceAccessHandlers } from '../../route-support'

const handlers = createAdminResourceAccessHandlers({
  getAccessList: getResourceAccessService,
  grantAccess: grantAccessService,
})

export const { GET, POST } = handlers
