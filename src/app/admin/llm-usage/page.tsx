'use client';

import React, { useState, useEffect } from 'react';
import {
    Activity,
    Database,
    DollarSign,
    AlertCircle,
    TrendingUp,
    Brain,
    Search,
    RefreshCw
} from 'lucide-react';
import { DashPageShell } from '@/components/admin/dash/dash-page-shell';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import {
    Tabs,
    TabsContent,
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
    BarChart,
    Bar,
    Cell
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils/index';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface Stats {
    totalCalls: number;
    successCalls: number;
    errorCalls: number;
    totalTokens: number;
    totalCost: number;
    inputTokens: number;
    outputTokens: number;
}

interface LogEntry {
    id: string;
    userId: string | null;
    user?: { name: string; email: string };
    feature: string;
    operation: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    inputCost: number;
    outputCost: number;
    totalCost: number;
    latencyMs: number | null;
    status: string;
    createdAt: string;
}

interface LlmData {
    totals: Stats;
    byFeature: Record<string, { totalCalls: number; totalTokens: number; totalCost: number; inputTokens: number; outputTokens: number }>;
    byModel: Record<string, { totalCalls: number; totalTokens: number; totalCost: number; inputTokens: number; outputTokens: number }>;
    daily: Array<{ date: string; calls: number; tokens: number; cost: number; inputTokens: number; outputTokens: number }>;
    alerts: { level: string; cost?: number; message?: string };
}

export default function LlmUsagePage() {
    const [data, setData] = useState<LlmData | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState('30d');
    const [logPage, setLogPage] = useState(1);
    const [logTotalPages, setLogTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [period]);

    useEffect(() => {
        fetchLogs();
    }, [logPage]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchData(), fetchLogs()]);
        setRefreshing(false);
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/v1/admin/llm-usage?period=${period}`);
            const json = await response.json();
            if (json.success) {
                setData(json.data);
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await fetch(`/api/v1/admin/llm-usage/logs?limit=10&page=${logPage}`);
            const json = await response.json();
            if (json.success) {
                setLogs(json.data.logs);
                setLogTotalPages(json.data.pagination.totalPages);
            }
        } catch (error) {
            console.error('Erro ao buscar logs:', error);
        }
    };

    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            await Promise.all([fetchData(), fetchLogs()]);
            setLoading(false);
        }
        loadInitial();
    }, [period]); // Reload when period changes


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return <div>Erro ao carregar dados.</div>;

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Sucesso</Badge>;
            case 'error': return <Badge variant="destructive">Erro</Badge>;
            case 'timeout': return <Badge variant="secondary">Timeout</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }

    return (
        <DashPageShell
            title="Monitoramento de IA"
            subtitle="Analise o uso, custos e performance dos modelos LLM."
            actions={(
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className={refreshing ? "animate-spin-slow" : ""}
                    >
                        <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
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
            {data.alerts?.level !== 'ok' && (
                <Alert variant={data.alerts.level === 'critical' ? 'destructive' : 'default'} className={data.alerts.level === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-900' : ''}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Alerta de Custo</AlertTitle>
                    <AlertDescription>{data.alerts.message}</AlertDescription>
                </Alert>
            )}

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chamadas Totais</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totals.totalCalls.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.totals.totalCalls > 0 ? ((data.totals.successCalls / data.totals.totalCalls) * 100).toFixed(1) : 0}% de sucesso
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tokens Consumidos</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{(data.totals.totalTokens / 1000).toFixed(1)}K</div>
                        <p className="text-xs text-muted-foreground">
                            {(data.totals.inputTokens / 1000).toFixed(1)}K in · {(data.totals.outputTokens / 1000).toFixed(1)}K out
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${data.totals.totalCost.toFixed(4)}</div>
                        <p className="text-xs text-muted-foreground">Estimado em USD</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Modelos Ativos</CardTitle>
                        <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Object.keys(data.byModel).length}</div>
                        <p className="text-xs text-muted-foreground">{Object.keys(data.byModel).join(', ')}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Daily Cost Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Histórico de Custos</CardTitle>
                        <CardDescription>Evolução dos gastos diários com IA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.daily}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(val) => {
                                            try { return format(new Date(val), 'dd/MM', { locale: ptBR }); }
                                            catch { return val; }
                                        }}
                                    />
                                    <YAxis tickFormatter={(val) => `$${val.toFixed(2)}`} />
                                    <Tooltip
                                        labelFormatter={(val) => {
                                            try { return format(new Date(val), 'PPPP', { locale: ptBR }); }
                                            catch { return val; }
                                        }}
                                        formatter={(val: number) => [`$${val.toFixed(4)}`, 'Custo']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="cost"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Breakdown Chart */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Uso por Funcionalidade</CardTitle>
                        <CardDescription>Distribuição de custos por feature</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(data.byFeature).map(([name, stats]) => ({ name, value: stats.totalCost }))} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        fontSize={12}
                                        tickFormatter={(val) => val === 'lesson-plan-generation' ? 'Plano Aula' : val === 'theme-refinement' ? 'Temas' : val}
                                    />
                                    <Tooltip formatter={(val: number) => [`$${val.toFixed(4)}`, 'Custo']} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {Object.entries(data.byFeature).map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Details Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição Detalhada</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(data.byFeature).length === 0 && (
                            <p className="text-center text-muted-foreground py-8">Nenhum dado registrado para este período.</p>
                        )}
                        {Object.entries(data.byFeature).map(([feature, stats]) => (
                            <div key={feature} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{feature === 'lesson-plan-generation' ? 'Geração de Planos de Aula' : feature === 'theme-refinement' ? 'Refinamento de Temas' : feature}</p>
                                        <div className="flex gap-2 text-sm text-muted-foreground">
                                            <span>{stats.totalCalls} chamadas</span>
                                            <span>·</span>
                                            <span>{(stats.inputTokens / 1000).toFixed(1)}K in</span>
                                            <span>·</span>
                                            <span>{(stats.outputTokens / 1000).toFixed(1)}K out</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">${stats.totalCost.toFixed(4)}</p>
                                    <p className="text-xs text-muted-foreground">{((stats.totalCost / (data.totals.totalCost || 1)) * 100).toFixed(1)}% do total</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Logs Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Logs Recentes</CardTitle>
                        <CardDescription>Ultimas 10 chamadas processadas</CardDescription>
                    </div>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuário</TableHead>
                                <TableHead>Feature</TableHead>
                                <TableHead>Operação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Tokens</TableHead>
                                <TableHead className="text-right">Custo</TableHead>
                                <TableHead className="text-right">Latência</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhum log encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">
                                        {log.user ? `${log.user.name} (${log.user.email})` : 'N/A'}
                                    </TableCell>
                                    <TableCell>{log.feature}</TableCell>
                                    <TableCell>{log.operation}</TableCell>
                                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                                    <TableCell className="text-right">{log.totalTokens.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">${log.totalCost.toFixed(4)}</TableCell>
                                    <TableCell className="text-right">{log.latencyMs ? `${log.latencyMs} ms` : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (logPage > 1) setLogPage(logPage - 1);
                                        }}
                                        className={logPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>

                                {Array.from({ length: Math.min(5, logTotalPages) }).map((_, i) => {
                                    // Simple logic to show a few pages
                                    let pageNum = logPage;
                                    if (logPage <= 3) pageNum = i + 1;
                                    else if (logPage >= logTotalPages - 2) pageNum = logTotalPages - 4 + i;
                                    else pageNum = logPage - 2 + i;

                                    if (pageNum < 1 || pageNum > logTotalPages) return null;

                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                isActive={logPage === pageNum}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setLogPage(pageNum);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (logPage < logTotalPages) setLogPage(logPage + 1);
                                        }}
                                        className={logPage >= logTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </CardContent>
            </Card>
        </DashPageShell>
    );
}
