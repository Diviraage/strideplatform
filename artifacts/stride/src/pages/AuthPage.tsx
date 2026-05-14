import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useLogin, useRegister, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'login') {
      loginMutation.mutate({ data: { email, password } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation('/assessment/block1');
        },
        onError: (err) => {
          setError(err.data?.error || 'Помилка авторизації');
        }
      });
    } else {
      registerMutation.mutate({ 
        data: { 
          email, 
          password, 
          name, 
          age: age ? parseInt(age, 10) : undefined 
        } 
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setLocation('/assessment/block1');
        },
        onError: (err) => {
          setError(err.data?.error || 'Помилка реєстрації');
        }
      });
    }
  };

  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-[400px] space-y-8 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="font-brand text-3xl font-bold">
            {mode === 'login' ? 'Увійти в профіль' : 'Створити акаунт'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' 
              ? 'Збережи свої результати та відстежуй прогрес' 
              : 'Отримай доступ до збереження результатів'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Вік (опціонально)</Label>
                <Input 
                  id="age" 
                  type="number" 
                  value={age} 
                  onChange={e => setAge(e.target.value)} 
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full h-12 text-base rounded-full" disabled={isPending}>
            {mode === 'login' ? 'Увійти →' : 'Зареєструватись →'}
          </Button>
        </form>

        <div className="text-center">
          <button 
            type="button" 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            {mode === 'login' ? 'Немає акаунту? Зареєструватись' : 'Вже є акаунт? Увійти'}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Або</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 text-base rounded-full"
          onClick={() => setLocation('/assessment/block1')}
        >
          Продовжити як гість (без збереження)
        </Button>
      </div>
    </div>
  );
}
