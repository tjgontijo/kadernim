import { Activity } from 'lucide-react';
import { CrudPageShell } from '@/components/admin/crud';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function LoadingAutomationsAnalytics() {
  return (
    <CrudPageShell
      title="Analytics de Automações"
      subtitle="Histórico de execuções de automações do sistema."
      icon={Activity}
      view="list"
      setView={() => {}}
      searchInput=""
      onSearchChange={() => {}}
      page={1}
      limit={15}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      totalItems={0}
      totalPages={0}
      hasMore={false}
      isLoading={true}
    >
      <div className="p-4 md:p-6 pb-20">
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Automação</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Ação</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10">Status</TableHead>
                <TableHead className="text-[11px] font-bold uppercase tracking-wider h-10 text-right pr-6">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-4">
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-7 w-16 rounded-md" />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Skeleton className="h-4 w-24 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CrudPageShell>
  );
}
