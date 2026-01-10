'use client';

import React, { useState, useEffect } from 'react';
import {
    Send,
    Pencil,
    Trash2,
    Plus,
    BarChart3,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface PushCampaign {
    id: string;
    name: string;
    title: string;
    body: string;
    url: string | null;
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';
    scheduledAt: string | null;
    sentAt: string | null;
    totalSent: number;
    totalClicked: number;
    createdAt: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/v1/admin/campaigns');
            const json = await response.json();
            if (json.success) {
                setCampaigns(json.data);
            }
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            toast.error('Erro ao carregar campanhas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!campaignToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/v1/admin/campaigns/${campaignToDelete}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Campanha excluída com sucesso');
                fetchCampaigns();
                setCampaignToDelete(null);
            } else {
                toast.error('Erro ao excluir campanha');
            }
        } catch (error) {
            toast.error('Erro inesperado');
        } finally {
            setIsDeleting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            DRAFT: { variant: 'secondary', label: 'Rascunho' },
            SCHEDULED: { variant: 'default', label: 'Agendada' },
            SENDING: { variant: 'default', label: 'Enviando' },
            SENT: { variant: 'outline', label: 'Enviada' },
            FAILED: { variant: 'destructive', label: 'Falhou' },
        };
        const config = variants[status] || variants.DRAFT;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Campanhas de Push</h1>
                    <p className="text-muted-foreground">
                        Gerencie campanhas de marketing via push notifications
                    </p>
                </div>
                <Link href="/admin/campaigns/analytics">
                    <Button variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Send className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Crie sua primeira campanha de push marketing
                            </p>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Campanha
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                    <CardDescription className="mt-1">{campaign.title}</CardDescription>
                                </div>
                                {getStatusBadge(campaign.status)}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {campaign.body}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Enviados:</span>
                                        <div className="font-medium">{campaign.totalSent}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Cliques:</span>
                                        <div className="font-medium">
                                            {campaign.totalClicked} (
                                            {campaign.totalSent > 0
                                                ? ((campaign.totalClicked / campaign.totalSent) * 100).toFixed(1)
                                                : 0}
                                            %)
                                        </div>
                                    </div>
                                </div>
                                {campaign.sentAt && (
                                    <div className="text-xs text-muted-foreground">
                                        Enviada em {format(new Date(campaign.sentAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                    </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Pencil className="h-3.5 w-3.5 mr-1" />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={() => setCampaignToDelete(campaign.id)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Delete Dialog */}
            <Dialog
                open={!!campaignToDelete}
                onOpenChange={(open) => !open && setCampaignToDelete(null)}
            >
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Excluir Campanha?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-sm text-muted-foreground">
                        Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setCampaignToDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
