export interface EditProfileInterface {
    name: string;
    phone: string;
}

export interface ProfileData {
    user_id: string;
    company_id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    permissions: string[];
    status: string;
    created_at: string;
    updated_at: string;
}