import React from 'react';
import { useLocation, Link } from 'wouter';
import { useGetMe, useGetMyResults, useLogout, getGetMeQueryKey, getGetMyResultsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: loadingUser } = useGetMe();
  const { data: results, isLoading: loadingResults } = useGetMyResults({ 
    query: { enabled: !!user, queryKey: getGetMyResultsQueryKey() } 
  });
  const logoutMutation = useLogout();

  if (loadingUser || loadingResults) {
    return <div className="p-12 text-center text-muted-foreground">Завантаження...</div>;
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/');
      }
    });
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="rounded-2xl border bg-card p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-brand text-3xl font-bold mb-1">{user.name}</h1>
          <p className="text-muted-foreground mb-4">{user.email}</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
              Пройдено тестів: {results?.length || 0}
            </span>
            {user.age && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium">
                Вік: {user.age}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Button variant="default" onClick={() => setLocation('/')} className="rounded-full">
            Пройти тест
          </Button>
          <Button variant="outline" onClick={handleLogout} className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" disabled={logoutMutation.isPending}>
            Вийти
          </Button>
        </div>
      </div>

      <h2 className="font-brand text-2xl font-bold mb-6">Мої результати</h2>

      {(!results || results.length === 0) ? (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          Результатів ще немає. Пройди тест!
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(r => (
            <Link key={r.id} href={`/result/${r.id}`}>
              <div className="rounded-xl border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-primary/50 transition-colors group">
                <div>
                  <div className="inline-flex items-center rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs font-medium mb-2 text-muted-foreground">
                    Карта Потенціалу
                  </div>
                  <h3 className="font-brand text-xl font-bold group-hover:text-primary transition-colors">{r.profile}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-primary text-sm font-medium mt-1">Переглянути →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
