import { createContext, useContext, useState, ReactNode } from 'react';

export type User = {
  id: string | null;
  nickname: string | null;
  email: string | null;
  socialId: string | null;
  profileImageUrl?: string | null;
  role: 'user' | 'admin' | 'master_admin' | null;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  inviteCode: string;
  startDate: Date | null;
  endDate: Date | null;
  createdBy: string;
};

type AppContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;

  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;

  inviteCode: string | null;
  setInviteCode: (code: string | null) => void;

  logout: () => void;
};


const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // inviteCode 기본값: null
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setCurrentEvent(null);


    setInviteCode(null);

    // localStorage 정리 
    localStorage.removeItem("accessToken");
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
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
