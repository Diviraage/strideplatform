import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetMe, useGetAdminStats, useGetAdminUsers, getGetAdminStatsQueryKey, getGetAdminUsersQueryKey } from '@workspace/api-client-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading: loadingUser } = useGetMe();
  
  const isEnabled = !!user && user.isAdmin;
  
  const { data: stats } = useGetAdminStats({ query: { enabled: isEnabled, queryKey: getGetAdminStatsQueryKey() } });
  const { data: users } = useGetAdminUsers({ query: { enabled: isEnabled, queryKey: getGetAdminUsersQueryKey() } });

  const [activeTab, setActiveTab] = useState('stats');
  const [search, setSearch] = useState('');
  const [compareIds, setCompareIds] = useState<number[]>([]);

  if (loadingUser) return <div className="p-12 text-center text-muted-foreground">Завантаження...</div>;

  if (!user || !user.isAdmin) {
    setLocation('/');
    return null;
  }

  const filteredUsers = users?.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCompareSelect = (id: number) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter(x => x !== id));
    } else if (compareIds.length < 2) {
      setCompareIds([...compareIds, id]);
    }
  };

  const handleDownloadJSON = () => {
    if (!users) return;
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stride_users_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    if (!users) return;
    const headers = ['id', 'name', 'email', 'age', 'resultCount', 'lastProfile', 'lastResultAt'];
    const rows = users.map(u => headers.map(h => `"${(u as any)[h] || ''}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stride_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-6xl py-12">
      <div className="mb-8">
        <h1 className="font-brand text-3xl font-bold mb-2">Адмін-панель</h1>
        <p className="text-muted-foreground">Керування платформою та аналітика S.T.R.I.D.E.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="h-12 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger value="stats" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Статистика
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Профілі
          </TabsTrigger>
          <TabsTrigger value="compare" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Порівняння
          </TabsTrigger>
          <TabsTrigger value="export" className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent">
            Експорт
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-8">
          {stats ? (
            <>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-2xl border bg-card p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Зареєстровано</div>
                  <div className="text-4xl font-bold">{stats.totalUsers}</div>
                </div>
                <div className="rounded-2xl border bg-card p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Проходжень</div>
                  <div className="text-4xl font-bold text-primary">{stats.totalResults}</div>
                </div>
                <div className="rounded-2xl border bg-card p-6">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Сер. когнітивний бал</div>
                  <div className="text-4xl font-bold text-stride-teal">{Math.round(stats.avgCogPct)}%</div>
                </div>
              </div>
              
              <div className="rounded-2xl border bg-card p-6">
                <h3 className="font-brand text-xl font-bold mb-6">Розподіл профілів</h3>
                <div className="space-y-4">
                  {Object.entries(stats.profileCounts).map(([name, count], i) => {
                    const pct = Math.round((count / stats.totalResults) * 100) || 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1 text-sm font-medium">
                          <span>{name}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary opacity-80" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">Завантаження статистики...</div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex md:w-1/3">
            <Input 
              placeholder="Пошук за ім'ям або email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="rounded-2xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Ім'я</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Вік</th>
                    <th className="px-6 py-4 font-medium">Профіль</th>
                    <th className="px-6 py-4 font-medium">Тестів</th>
                    <th className="px-6 py-4 font-medium">Ост. результат</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredUsers?.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">{u.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">{u.age || '-'}</td>
                      <td className="px-6 py-4">
                        {u.lastProfile ? (
                          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                            {u.lastProfile}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">{u.resultCount}</td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {u.lastResultAt ? new Date(u.lastResultAt).toLocaleDateString('uk-UA') : '-'}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">Користувачів не знайдено</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compare" className="space-y-8">
          <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
            Оберіть двох користувачів з таблиці для порівняння (Модуль в розробці).
          </div>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-brand text-xl font-bold">Аналітичні дані</h3>
              <p className="text-sm text-muted-foreground mb-4">Повне вивантаження бази користувачів та їх результатів у форматі JSON для подальшого аналізу.</p>
              <Button onClick={handleDownloadJSON} className="w-full rounded-full">⬇ Завантажити JSON</Button>
            </div>
            
            <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
              <div className="text-4xl mb-2">📑</div>
              <h3 className="font-brand text-xl font-bold">Табличні дані</h3>
              <p className="text-sm text-muted-foreground mb-4">Спрощене вивантаження для роботи в Excel, Google Sheets або BI-системах.</p>
              <Button onClick={handleDownloadCSV} variant="outline" className="w-full rounded-full border-primary text-primary hover:bg-primary/5">⬇ Завантажити CSV</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
