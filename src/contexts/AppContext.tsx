import { createContext, useContext, useState, ReactNode } from 'react';

export type User = {
  id: string;
  nickname: string;
  email: string;
  role: 'user' | 'admin' | 'master_admin';
};

export type Event = {
  id: string;
  title: string;
  description: string;
  inviteCode: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
};

type AppContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [inviteCode, setInviteCode] = useState<string>('');

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setCurrentEvent(null);
    setInviteCode('');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        currentEvent,
        setCurrentEvent,
        inviteCode,
        setInviteCode,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
