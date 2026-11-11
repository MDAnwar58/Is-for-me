import { usePage } from '@inertiajs/react';

type AuthPageProps = {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        } | null;
        permissions?: string[];
        roles?: string[];
    };
};

export function usePermissions() {
    const { auth } = usePage<AuthPageProps>().props;
    const permissions = auth.permissions ?? [];
    const roles = auth.roles ?? [];

    return {
        permissions,
        roles,
        can: (permission: string): boolean => permissions.includes(permission),
        hasRole: (role: string): boolean => roles.includes(role),
        isAdmin: (): boolean => roles.includes('admin'),
    };
}
