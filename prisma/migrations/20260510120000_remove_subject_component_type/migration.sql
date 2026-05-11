-- Drop unique index created for Subject.type
DROP INDEX IF EXISTS "subject_type_key";

-- Drop column from subject
ALTER TABLE "subject" DROP COLUMN IF EXISTS "type";

-- Drop enum type if no longer referenced
DROP TYPE IF EXISTS "SubjectComponentType";
