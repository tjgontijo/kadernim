export interface AutomationRule {
    id: string;
    name: string;
    eventType: string;
    isActive: boolean;
    description: string | null;
    actions: { id: string; type: string; config: any }[];
    _count?: { logs: number };
    createdAt: string;
}
