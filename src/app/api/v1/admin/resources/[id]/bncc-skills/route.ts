import {
  linkResourceBnccSkill,
  listResourceBnccSkills,
} from '@/lib/resources/services/admin'
import { createAdminResourceBnccHandlers } from '../../route-support'

const handlers = createAdminResourceBnccHandlers({
  listSkills: listResourceBnccSkills,
  linkSkill: linkResourceBnccSkill,
})

export const { GET, POST } = handlers
