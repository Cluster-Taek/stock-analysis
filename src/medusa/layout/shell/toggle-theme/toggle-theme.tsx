'use client';

import { Moon, Sun } from '@medusajs/icons';
import { Button } from '@medusajs/ui';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="transparent"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      size="small"
      className="ml-auto"
    >
      {theme === 'dark' ? <Moon /> : <Sun />}
    </Button>
  );
};
