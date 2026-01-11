'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Send,
    MousePointerClick,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DashPageShell } from '@/components/admin/dash/dash-page-shell';
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AnalyticsData {
    kpis: {
        totalCampaigns: number;
        sentCampaigns: number;
        totalSent: number;
        totalClicked: number;
        ctr: string;
        topCampaign: {
            title: string;
            totalSent: number;
            totalClicked: number;
            ctr: string;
        } | null;
    };
    daily: Array<{
        date: string;
        sent: number;
        clicked: number;
    }>;
    campaigns: Array<{
        id: string;
        title: string;
        totalSent: number;
        totalClicked: number;
        ctr: string;
        sentAt: string;
    }>;
}

export default function CampaignsAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/v1/admin/campaigns/analytics?period=${period}`);
            const json = await response.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Erro ao buscar analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return <div>Erro ao carregar dados.</div>;

    return (
        <DashPageShell
            title="Analytics de Push"
            subtitle="Acompanhe o desempenho das suas campanhas de marketing"
            actions={(
                <div className="flex items-center gap-2">
                    <Link href="/admin/campaigns">
                        <Button variant="outline" size="sm">
                            Voltar para Campanhas
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
                    </Button>
                    <Tabs value={period} onValueChange={setPeriod} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="7d">7d</TabsTrigger>
                            <TabsTrigger value="30d">30d</TabsTrigger>
                            <TabsTrigger value="90d">90d</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            )}
        >
            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Enviados</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.kpis.totalSent.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.kpis.sentCampaigns} campanhas enviadas
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data.kpis.totalClicked.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data.kpis.ctr}% de taxa de clique
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Engajamento</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.kpis.ctr}%</div>
                        <p className="text-xs text-muted-foreground">CTR médio do período</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Melhor Campanha</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {data.kpis.topCampaign ? (
                            <>
                                <div className="text-2xl font-bold">{data.kpis.topCampaign.ctr}%</div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {data.kpis.topCampaign.title}
                                </p>
                            </>
                        ) : (
                            <div className="text-sm text-muted-foreground">Sem dados</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Performance</CardTitle>
                    <CardDescription>Envios e cliques ao longo do tempo</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => {
                                        try {
                                            return format(new Date(val), 'dd/MM', { locale: ptBR });
                                        } catch {
                                            return val;
                                        }
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(val) => {
                                        try {
                                            return format(new Date(val as string), 'PPPP', {
                                                locale: ptBR,
                                            });
                                        } catch {
                                            return val;
                                        }
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="sent"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    name="Enviados"
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="clicked"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Clicados"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Ranking de Campanhas */}
            <Card>
                <CardHeader>
                    <CardTitle>Ranking de Campanhas</CardTitle>
                    <CardDescription>Top 10 campanhas por performance</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campanha</TableHead>
                                <TableHead className="text-right">Enviados</TableHead>
                                <TableHead className="text-right">Cliques</TableHead>
                                <TableHead className="text-right">CTR</TableHead>
                                <TableHead className="text-right">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.campaigns.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Nenhuma campanha enviada ainda.
                                    </TableCell>
                                </TableRow>
                            )}
                            {data.campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.title}</TableCell>
                                    <TableCell className="text-right">
                                        {campaign.totalSent.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {campaign.totalClicked.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="outline">{campaign.ctr}%</Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                        {format(new Date(campaign.sentAt), 'dd/MM/yyyy', {
                                            locale: ptBR,
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashPageShell>
    );
}
