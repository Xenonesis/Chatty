'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button variant="outline" size="icon" onClick={cycleTheme}>
      {theme === 'light' && (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      {theme === 'dark' && (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      {theme === 'system' && (
        <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
