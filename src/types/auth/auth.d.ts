import { UserRoleType } from '@/types/users/user-role';

declare module "better-auth" {
    interface User {
        role: UserRoleType;
    }
}
