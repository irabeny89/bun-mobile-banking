import { useEffect, useState } from 'react';
import { Button } from "../ui/button";
import { APP_NAME } from '../../config';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = () => {
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA) return null;

  return (
    <Button variant="outline" size="sm" onClick={onClick} className="fixed bottom-4 right-4 z-50">
      Install {APP_NAME} App
    </Button>
  );
}