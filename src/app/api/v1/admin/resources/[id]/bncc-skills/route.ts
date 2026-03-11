import {
  linkResourceBnccSkill,
  listResourceBnccSkills,
} from '@/services/resources/admin'
import { createAdminResourceBnccHandlers } from '../../route-support'

const handlers = createAdminResourceBnccHandlers({
  listSkills: listResourceBnccSkills,
  linkSkill: linkResourceBnccSkill,
})

export const { GET, POST } = handlers
