import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id: string | null;
  nickname: string | null;
  email: string | null;
  socialId: string | null;
  profileImageUrl?: string | null;
  role: "user" | "admin" | "master_admin" | null;
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
  const [currentEvent, _setCurrentEvent] = useState<Event | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);


  useEffect(() => {
    const saved = localStorage.getItem("currentEvent");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        parsed.startDate = parsed.startDate ? new Date(parsed.startDate) : null;
        parsed.endDate = parsed.endDate ? new Date(parsed.endDate) : null;

        _setCurrentEvent(parsed);
      } catch (err) {
        console.error("currentEvent 복구 실패:", err);
      }
    }
  }, []);

 
  const setCurrentEvent = (event: Event | null) => {
    _setCurrentEvent(event);

    if (event) {
      localStorage.setItem("currentEvent", JSON.stringify(event));
    } else {
      localStorage.removeItem("currentEvent");
    }
  };


  const logout = () => {
    setUser(null);
    setAccessToken(null);
    setCurrentEvent(null);
    setInviteCode(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentEvent");
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
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
