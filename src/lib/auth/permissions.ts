import { UserRoleType } from "@/types/users/user-role";

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'download';
export type PermissionSubject = 'Resource' | 'User' | 'Subject' | 'Organization' | 'Analytics' | 'all';

export interface Ability {
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
}

const ROLES_PERMISSIONS: Record<string, Partial<Record<PermissionSubject, PermissionAction[]>>> = {
    admin: {
        all: ['manage'],
    },
    manager: {
        Resource: ['create', 'read', 'update', 'delete', 'download'],
        User: ['create', 'read', 'update'], // No delete
        Subject: ['create', 'read', 'update', 'delete'],
        Organization: ['read'],
        Analytics: ['read'],
    },
    editor: {
        Resource: ['create', 'read', 'update', 'download'],
        Subject: ['read'],
    },
    subscriber: {
        Resource: ['read', 'download'],
    },
    user: {
        Resource: ['read'],
    }
};

export function defineAbilitiesFor(role: UserRoleType): Ability {
    const permissions = ROLES_PERMISSIONS[role] || {};

    return {
        can: (action: PermissionAction, subject: PermissionSubject) => {
            // Admin can do anything
            if (permissions['all']?.includes('manage')) return true;

            const subjectPermissions = permissions[subject] || [];

            // 'manage' action implies all other actions
            if (subjectPermissions.includes('manage')) return true;

            return subjectPermissions.includes(action);
        }
    };
}
