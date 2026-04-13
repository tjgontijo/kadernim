export {
  BulkDeleteResourcesSchema,
  BulkOperationResultSchema,
  BulkUpdateResourcesSchema,
  CreateResourceSchema,
  GrantResourceAccessSchema,

  ListResourcesFilterSchema,
  ReorderResourceImagesSchema,
  ResourceDetailResponseSchema,
  ResourceListResponseSchema,
  UpdateResourceImageSchema,
  UpdateResourceSchema,
  UpdateResourceVideoSchema,
} from './admin-resource-schemas'
export type {
  BulkDeleteResourcesInput,
  BulkOperationResult,
  BulkUpdateResourcesInput,
  CreateResourceInput,
  GrantResourceAccessInput,

  ListResourcesFilter,
  ResourceDetailResponse,
  ResourceListResponse as AdminResourceListResponse,
  UpdateResourceImageInput,
  UpdateResourceInput,
  UpdateResourceVideoInput,
} from './admin-resource-schemas'
export {
  ResourceDetailSchema,
  ResourceFileMetadataSchema,
  ResourceFilterSchema,
  ResourceImageSchema,
  ResourceListResponseSchema as CatalogResourceListResponseSchema,
  ResourceSchema,
  ResourceVideoSchema,
} from './resource-schemas'
export type {
  Resource,
  ResourceDetail,
  ResourceFileMetadata,
  ResourceFilter,
  ResourceImage,
  ResourceListResponse,
  ResourceVideo,
} from './resource-schemas'
