import { BulkUpdateResourcesInput, BulkDeleteResourcesInput } from '@/lib/schemas/admin/resources'
import { updateResourceService } from './update-service'
import { deleteResourceService } from './delete-service'

export interface BulkOperationError {
  id: string
  error: string
}

export interface BulkUpdateResult {
  updated: number
  failed: number
  errors: BulkOperationError[]
}

export interface BulkDeleteResult {
  deleted: number
  failed: number
  errors: BulkOperationError[]
}

/**
 * Update multiple resources
 * Processes each resource sequentially and collects errors
 */
export async function bulkUpdateResourcesService(
  input: BulkUpdateResourcesInput,
  adminId: string
): Promise<BulkUpdateResult> {
  const { ids, updates } = input
  const errors: BulkOperationError[] = []
  let updated = 0

  for (const id of ids) {
    try {
      await updateResourceService({
        id,
        ...updates,
        adminId,
      })
      updated++
    } catch (error) {
      errors.push({
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    updated,
    failed: errors.length,
    errors,
  }
}

/**
 * Delete multiple resources
 * Processes each resource sequentially and collects errors
 */
export async function bulkDeleteResourcesService(
  input: BulkDeleteResourcesInput,
  adminId: string
): Promise<BulkDeleteResult> {
  const { ids } = input
  const errors: BulkOperationError[] = []
  let deleted = 0

  for (const id of ids) {
    try {
      await deleteResourceService(id, adminId)
      deleted++
    } catch (error) {
      errors.push({
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return {
    deleted,
    failed: errors.length,
    errors,
  }
}
