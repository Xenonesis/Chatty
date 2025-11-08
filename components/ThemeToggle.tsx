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
      <Sun className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 ${
        theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
      }`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 ${
        theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
      }`} />
      <Monitor className={`h-[1.2rem] w-[1.2rem] absolute transition-all duration-300 ${
        theme === 'system' ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
