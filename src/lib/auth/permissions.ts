import { UserRoleType } from "@/types/user-role";

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';
export type PermissionSubject = 'Resource' | 'User' | 'Subject' | 'Organization' | 'Analytics' | 'all';

export interface Ability {
    can: (action: PermissionAction, subject: PermissionSubject) => boolean;
}

const ROLES_PERMISSIONS: Record<string, Partial<Record<PermissionSubject, PermissionAction[]>>> = {
    admin: {
        all: ['manage'],
    },
    manager: {
        Resource: ['create', 'read', 'update', 'delete'],
        User: ['create', 'read', 'update'], // No delete
        Subject: ['create', 'read', 'update', 'delete'],
        Organization: ['read'],
        Analytics: ['read'],
    },
    editor: {
        Resource: ['create', 'read', 'update'],
        Subject: ['read'],
    },
    subscriber: {
        Resource: ['read'],
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
