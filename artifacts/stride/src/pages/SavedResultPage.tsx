import React from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import { useGetResult, getGetResultQueryKey } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { PROFILE_DATA } from '@/data/profiles';

export default function SavedResultPage() {
  const [, params] = useRoute('/result/:id');
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: result, isLoading, isError } = useGetResult(id, { 
    query: { enabled: !!id, queryKey: getGetResultQueryKey(id) } 
  });

  if (isLoading) return <div className="p-12 text-center text-muted-foreground">Завантаження...</div>;
  if (isError || !result) {
    return (
      <div className="container max-w-xl py-24 text-center space-y-6">
        <h2 className="font-brand text-2xl font-bold">Результат не знайдено</h2>
        <Button onClick={() => setLocation('/profile')} variant="outline" className="rounded-full">
          ← Назад до профілю
        </Button>
      </div>
    );
  }

  const profileInfo = PROFILE_DATA[result.profile];
  if (!profileInfo) return null;

  const dateStr = new Date(result.createdAt).toLocaleDateString('uk-UA', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation('/profile')} className="rounded-full px-4 -ml-4">
          ← Назад до профілю
        </Button>
        <div className="text-sm font-mono text-muted-foreground">{dateStr}</div>
      </div>

      <div className="mb-12">
        <div className="inline-flex items-center rounded-full border bg-muted/50 px-3 py-1 text-sm font-medium mb-6 text-muted-foreground">
          Збережений результат · {result.userName || 'Гість'}
        </div>
        <h1 className="font-brand text-4xl md:text-5xl font-bold mb-4">{result.profile}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">{profileInfo.tagline}</p>
      </div>

      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-brand text-xl font-bold mb-2">Суперсила: {profileInfo.superpower}</h3>
            <p className="text-muted-foreground">{profileInfo.superpowerDesc}</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-brand text-xl font-bold mb-2">Сліпа зона: {profileInfo.blindspot}</h3>
            <p className="text-muted-foreground">{profileInfo.blindspotDesc}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          <h3 className="font-brand text-xl font-bold mb-6">Когнітивний профіль</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>Когнітивний</span>
                <span className="text-primary">{result.cogPct}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${result.cogPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>Енергетичний</span>
                <span className="text-stride-teal">{result.enPct}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-stride-teal" style={{ width: `${result.enPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2 text-sm font-medium">
                <span>Адаптивність</span>
                <span className="text-stride-coral">{result.adPct}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-stride-coral" style={{ width: `${result.adPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 bg-gradient-to-br from-card to-primary/5">
          <h3 className="font-brand text-2xl font-bold mb-2">{profileInfo.trajectory}</h3>
          <p className="text-muted-foreground">{profileInfo.trajectoryDesc}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-brand text-xl font-bold mb-4">Сценарії самореалізації</h3>
            <div className="space-y-3">
              {profileInfo.scenarios.map((sc: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.color }} />
                    <span className="font-medium text-sm">{sc.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{sc.fit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-brand text-xl font-bold mb-4">Шлях навчання</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{profileInfo.learningPath}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
