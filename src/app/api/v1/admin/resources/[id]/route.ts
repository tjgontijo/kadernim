import {
  deleteResourceService,
  getAdminResourceDetail,
  updateResourceService,
} from '@/services/resources'
import { createAdminResourceCrudHandlers } from '../route-support'

const handlers = createAdminResourceCrudHandlers({
  getDetail: getAdminResourceDetail,
  updateResource: updateResourceService,
  deleteResource: deleteResourceService,
})

export const { GET, PUT, DELETE } = handlers
