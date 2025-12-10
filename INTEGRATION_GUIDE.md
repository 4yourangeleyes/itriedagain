# Frontend Integration Guide - API Migration

This guide shows how to update each page to use the new real API instead of the mock database.

## App.tsx - Authentication Context

Replace the mock login/logout with real auth:

```tsx
// OLD: import { db } from './services/mockDb';
// NEW:
import { authService } from './services/api';

const AuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        // Not logged in, that's ok
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.login(email, password);
      setUser(user);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { user, login, logout, isLoading, error };
};
```

---

## Login.tsx

```tsx
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        type="email"
        label="EMAIL"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />
      <Input 
        type="password"
        label="PASSWORD"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <div className="text-danger text-sm">{error}</div>}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

---

## Dashboard.tsx

```tsx
import { projectService } from '../services/api';
import { analyticsService } from '../services/api';
import { clockService } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [burnRate, setBurnRate] = useState<number>(0);
  const [efficiency, setEfficiency] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [allEntries, allUsers, rate, eff] = await Promise.all([
          clockService.getTodayClockEntries(user.id),
          userService.getUsers(user.orgId),
          analyticsService.getBurnRate(user.orgId),
          analyticsService.getTeamEfficiency(user.orgId),
        ]);

        setEntries(allEntries);
        setUsers(allUsers);
        setBurnRate(rate);
        setEfficiency(eff);

        // Find active users
        const activeEntries = allEntries.filter(e => e.status === 'ACTIVE');
        const activeUserIds = activeEntries.map(e => e.userId);
        setActiveUsers(allUsers.filter(u => activeUserIds.includes(u.id)));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscriptions.onClockEntriesChange(user.orgId, async () => {
      const entries = await clockService.getTodayClockEntries(user.id);
      setEntries(entries);
    });

    return unsubscribe;
  }, [user]);

  // ... rest of component
}
```

---

## Projects.tsx

```tsx
import { projectService, phaseService, shiftService } from '../services/api';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects(user.orgId, true);
        setProjects(data);
        if (selectedProject) {
          const updated = data.find(p => p.id === selectedProject.id);
          if (updated) setSelectedProject(updated);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    loadProjects();
  }, [user]);

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await projectService.createProject({
        ...projectData,
        orgId: user!.orgId,
      });

      // Add phases if provided
      if (projectData.phases) {
        for (const phase of projectData.phases) {
          await phaseService.createPhase(newProject.id, phase.name, phase.goals);
        }
      }

      setProjects([...projects, newProject]);
      setIsProjectModalOpen(false);
    } catch (error: any) {
      console.error('Failed to create project:', error.message);
    }
  };

  const handleCreateShift = async (shiftData: any) => {
    try {
      const shift = await shiftService.createShift({
        ...shiftData,
        orgId: user!.orgId,
      });

      // Reload shifts
      const updatedProject = await projectService.getProjects(user!.orgId);
      setProjects(updatedProject);
    } catch (error: any) {
      console.error('Failed to create shift:', error.message);
    }
  };

  // ... rest of component
}
```

---

## TimeClock.tsx

```tsx
import { shiftService, clockService, wellnessService } from '../services/api';

export default function TimeClock() {
  const { user } = useAuth();
  const [upcomingShift, setUpcomingShift] = useState<Shift | null>(null);
  const [activeEntry, setActiveEntry] = useState<ClockEntry | null>(null);
  const [clockError, setClockError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadShifts = async () => {
      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const shifts = await shiftService.getShiftsByUser(user.id, todayStart);
        const upcoming = shifts.find(s => s.endAt > Date.now());
        
        if (upcoming) {
          setUpcomingShift(upcoming);
        }
      } catch (error) {
        console.error('Failed to load shifts:', error);
      }
    };

    loadShifts();
  }, [user]);

  const handleClockIn = async () => {
    if (!user || !upcomingShift) return;

    try {
      const org = await orgService.getOrg(user.orgId);
      const result = await clockService.canClockIn(upcomingShift, org);

      if (!result.allowed) {
        setClockError(result.reason || 'Cannot clock in');
        return;
      }

      const entry = await clockService.clockIn(user.id, upcomingShift.id);
      setActiveEntry(entry);
      setShowBriefing(false);
    } catch (error: any) {
      setClockError(error.message);
    }
  };

  const handleClockOut = async (summary: string, moraleScore: number) => {
    if (!user || !activeEntry) return;

    try {
      // Clock out with validation
      const updatedEntry = await clockService.clockOut(
        activeEntry.id,
        summary,
        moraleScore,
        false
      );

      // Log mood for post-shift
      await wellnessService.logMood(
        user.id,
        'POST_SHIFT',
        moraleScore,
        '😊',
        summary
      );

      setActiveEntry(null);
      setShowSuccessMessage(true);
    } catch (error: any) {
      setClockError(error.message);
    }
  };

  // ... rest of component
}
```

---

## Chat.tsx

```tsx
import { chatService, userService } from '../services/api';
import { subscriptions } from '../services/api';

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      try {
        const userChats = await chatService.getChats(user.id);
        setChats(userChats);
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };

    loadChats();

    // Subscribe to new messages
    const unsubscribe = subscriptions.onMessageReceived(
      activeChatId || '',
      async () => {
        if (activeChatId) {
          const newMessages = await chatService.getMessages(activeChatId);
          setMessages(newMessages);
        }
      }
    );

    return unsubscribe;
  }, [user, activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;

    const loadMessages = async () => {
      try {
        const msgs = await chatService.getMessages(activeChatId, 50);
        setMessages(msgs);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();
  }, [activeChatId]);

  const handleSendMessage = async (content: string) => {
    if (!user || !activeChatId) return;

    try {
      await chatService.sendMessage(activeChatId, user.id, content);
      const messages = await chatService.getMessages(activeChatId);
      setMessages(messages);
    } catch (error: any) {
      console.error('Failed to send message:', error.message);
    }
  };

  const handleCreateChat = async (participantIds: string[], name?: string) => {
    if (!user) return;

    try {
      const newChat = await chatService.createChat(
        user.orgId,
        [...participantIds, user.id],
        name
      );
      setChats([...chats, newChat]);
      setActiveChatId(newChat.id);
    } catch (error: any) {
      console.error('Failed to create chat:', error.message);
    }
  };

  // ... rest of component
}
```

---

## People.tsx

```tsx
import { userService, wellnessService } from '../services/api';

export default function People() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    if (!user) return;

    const loadEmployees = async () => {
      try {
        const users = await userService.getUsers(user.orgId);
        setEmployees(users);
      } catch (error) {
        console.error('Failed to load employees:', error);
      }
    };

    loadEmployees();
  }, [user]);

  useEffect(() => {
    if (!selectedEmployee) return;

    const loadEmployeeData = async () => {
      try {
        const [employeeMoods, employeeGoals, employeeBlockers] = await Promise.all([
          wellnessService.getMoodEntries(selectedEmployee.id),
          wellnessService.getGoals(selectedEmployee.id),
          wellnessService.getBlockers(selectedEmployee.id),
        ]);

        setMoods(employeeMoods);
        setGoals(employeeGoals);
        setBlockers(employeeBlockers);
      } catch (error) {
        console.error('Failed to load employee data:', error);
      }
    };

    loadEmployeeData();
  }, [selectedEmployee]);

  const handleCreateGoal = async (title: string, description: string, targetDate: number) => {
    if (!selectedEmployee) return;

    try {
      const newGoal = await wellnessService.createGoal(
        selectedEmployee.id,
        title,
        description,
        targetDate
      );
      setGoals([...goals, newGoal]);
    } catch (error: any) {
      console.error('Failed to create goal:', error.message);
    }
  };

  // ... rest of component
}
```

---

## Settings.tsx

```tsx
import { orgService } from '../services/api';
import { userService } from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadOrg = async () => {
      try {
        const organization = await orgService.getOrg(user.orgId);
        setOrg(organization);
      } catch (error) {
        console.error('Failed to load organization:', error);
      }
    };

    loadOrg();
  }, [user]);

  const handleUpdatePermissions = async (permissions: Record<string, number>) => {
    if (!org) return;

    try {
      const updated = await orgService.updatePermissions(org.id, permissions);
      setOrg(updated);
    } catch (error: any) {
      console.error('Failed to update permissions:', error.message);
    }
  };

  const handleAddHierarchyLevel = async (levelName: string) => {
    if (!org) return;

    try {
      const updated = await orgService.updateOrg({
        ...org,
        hierarchyLevels: [...org.hierarchyLevels, levelName],
      });
      setOrg(updated);
    } catch (error: any) {
      console.error('Failed to add hierarchy level:', error.message);
    }
  };

  // ... rest of component
}
```

---

## Key Changes Summary

| Aspect | Old | New |
|--------|-----|-----|
| Database | localStorage | Supabase |
| Import | `import { db }` | `import { *Service }` |
| Methods | `db.getProjects()` | `projectService.getProjects()` |
| Validation | None | Comprehensive |
| Errors | Generic | Specific messages |
| Real-time | BroadcastChannel | Subscriptions |
| Auth | Mock | Real (Supabase Auth) |

## Error Handling Pattern

```tsx
try {
  const result = await apiService.method();
  // Success
} catch (error: any) {
  if (error.code === 'VALIDATION_ERROR') {
    // Handle validation error
  } else if (error.code === 'PERMISSION_DENIED') {
    // Handle permission error
  } else {
    // Handle other errors
    console.error(error.message);
  }
}
```

## Testing Checklist

- [ ] Login with real credentials
- [ ] Create organization
- [ ] Add users
- [ ] Create project with phases
- [ ] Schedule shifts
- [ ] Clock in/out with validation
- [ ] Send chat messages
- [ ] Log mood entries
- [ ] Create goals and blockers
- [ ] Check real-time updates
- [ ] Verify permissions enforcement
- [ ] Test error messages

---

**Next Phase:** Update all pages using these patterns
**Estimated Time:** 3-5 hours
**Difficulty:** Low (API is drop-in replacement for mock DB)
