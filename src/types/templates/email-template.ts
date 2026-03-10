export interface EmailTemplate {
    id: string;
    slug: string;
    name: string;
    subject: string;
    preheader: string | null;
    body: string;
    content?: any;
    eventType: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
