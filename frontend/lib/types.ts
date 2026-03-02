import type { RoleKey } from "./roles";

/** Payload accepted by the signUp function. */
export interface SignUpPayload {
    email: string;
    password: string;
    fullName: string;
    role: RoleKey;
    /** Required when role is "NGO". */
    organizationName?: string;
}

/** Row shape for the "profiles" table. */
export interface Profile {
    id: string;
    full_name: string;
    email: string;
    role_id: string;
    organization_name: string | null;
}
