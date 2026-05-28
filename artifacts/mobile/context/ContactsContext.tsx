import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

export interface ContactItem {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

type Decision = "keep" | "delete";

interface ContactsContextType {
  contacts: ContactItem[];
  currentIndex: number;
  decisions: Record<string, Decision>;
  permissionStatus: "loading" | "granted" | "denied" | "web";
  isApplying: boolean;
  isDone: boolean;
  toDeleteCount: number;
  swipeRight: () => void;
  swipeLeft: () => void;
  applyDeletions: () => Promise<void>;
  reset: () => void;
  requestPermission: () => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | null>(null);

const STORAGE_KEY = "@contact_swiper_decisions";
const INDEX_KEY = "@contact_swiper_index";

const MOCK_CONTACTS: ContactItem[] = [
  { id: "1", name: "Alex Rivera", phoneNumbers: ["+1 (555) 234-5678"], emails: ["alex.rivera@email.com"] },
  { id: "2", name: "Jordan Kim", phoneNumbers: ["+1 (555) 345-6789"], emails: [] },
  { id: "3", name: "Sam Patel", phoneNumbers: ["+1 (555) 456-7890", "+1 (555) 111-2222"], emails: ["sam@work.com"] },
  { id: "4", name: "Morgan Lee", phoneNumbers: [], emails: ["morgan.lee@gmail.com"] },
  { id: "5", name: "Casey Chen", phoneNumbers: ["+1 (555) 567-8901"], emails: ["casey@company.co"] },
  { id: "6", name: "Taylor Brooks", phoneNumbers: ["+1 (555) 678-9012"], emails: [] },
  { id: "7", name: "Drew Williams", phoneNumbers: ["+1 (555) 789-0123"], emails: ["drew.w@example.org"] },
  { id: "8", name: "Quinn Martinez", phoneNumbers: ["+1 (555) 890-1234"], emails: ["quinn@mail.net"] },
  { id: "9", name: "Avery Thompson", phoneNumbers: ["+1 (555) 901-2345"], emails: [] },
  { id: "10", name: "Reese Johnson", phoneNumbers: ["+1 (555) 012-3456"], emails: ["reese.j@email.com"] },
  { id: "11", name: "Blake Anderson", phoneNumbers: ["+1 (555) 123-9876"], emails: [] },
  { id: "12", name: "Harper Wilson", phoneNumbers: ["+1 (555) 987-6543"], emails: ["harper@mymail.io"] },
];

// Lazy-load expo-contacts only on native to avoid web crashes
function getContactsLib() {
  if (Platform.OS === "web") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-contacts") as typeof import("expo-contacts");
}

export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [permissionStatus, setPermissionStatus] = useState<
    "loading" | "granted" | "denied" | "web"
  >("loading");
  const [isApplying, setIsApplying] = useState(false);

  const isDone = contacts.length > 0 && currentIndex >= contacts.length;
  const toDeleteCount = Object.values(decisions).filter((d) => d === "delete").length;

  const loadSavedProgress = async (contactList: ContactItem[]) => {
    try {
      const [savedDecisions, savedIndex] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(INDEX_KEY),
      ]);
      if (savedDecisions) setDecisions(JSON.parse(savedDecisions));
      if (savedIndex) {
        const idx = parseInt(savedIndex, 10);
        if (!isNaN(idx) && idx <= contactList.length) setCurrentIndex(idx);
      }
    } catch (_) {}
  };

  const loadNativeContacts = useCallback(async () => {
    const Contacts = getContactsLib();
    if (!Contacts) return;
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });
      const mapped: ContactItem[] = data
        .filter((c) => c.name && c.name.trim().length > 0)
        .map((c) => ({
          id: c.id ?? `${c.name}-${Math.random()}`,
          name: c.name ?? "Unknown",
          phoneNumbers: (c.phoneNumbers ?? [])
            .map((p) => p.number ?? "")
            .filter(Boolean),
          emails: (c.emails ?? []).map((e) => e.email ?? "").filter(Boolean),
        }));
      setContacts(mapped);
      setPermissionStatus("granted");
      await loadSavedProgress(mapped);
    } else {
      setPermissionStatus("denied");
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      setContacts(MOCK_CONTACTS);
      setPermissionStatus("web");
      await loadSavedProgress(MOCK_CONTACTS);
      return;
    }
    await loadNativeContacts();
  }, [loadNativeContacts]);

  useEffect(() => {
    if (Platform.OS === "web") {
      setContacts(MOCK_CONTACTS);
      setPermissionStatus("web");
      loadSavedProgress(MOCK_CONTACTS);
      return;
    }
    const Contacts = getContactsLib();
    if (!Contacts) {
      setPermissionStatus("denied");
      return;
    }
    Contacts.getPermissionsAsync().then(({ status }) => {
      if (status === "granted") {
        loadNativeContacts();
      } else {
        setPermissionStatus("denied");
      }
    });
  }, [loadNativeContacts]);

  const saveProgress = async (
    newDecisions: Record<string, Decision>,
    newIndex: number
  ) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newDecisions)),
        AsyncStorage.setItem(INDEX_KEY, String(newIndex)),
      ]);
    } catch (_) {}
  };

  const swipeRight = useCallback(() => {
    if (currentIndex >= contacts.length) return;
    const contact = contacts[currentIndex];
    const newDecisions = { ...decisions, [contact.id]: "keep" as Decision };
    const newIndex = currentIndex + 1;
    setDecisions(newDecisions);
    setCurrentIndex(newIndex);
    saveProgress(newDecisions, newIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [contacts, currentIndex, decisions]);

  const swipeLeft = useCallback(() => {
    if (currentIndex >= contacts.length) return;
    const contact = contacts[currentIndex];
    const newDecisions = { ...decisions, [contact.id]: "delete" as Decision };
    const newIndex = currentIndex + 1;
    setDecisions(newDecisions);
    setCurrentIndex(newIndex);
    saveProgress(newDecisions, newIndex);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [contacts, currentIndex, decisions]);

  const applyDeletions = useCallback(async () => {
    if (Platform.OS === "web") return;
    const Contacts = getContactsLib();
    if (!Contacts) return;
    setIsApplying(true);
    try {
      const toDelete = Object.entries(decisions)
        .filter(([, v]) => v === "delete")
        .map(([id]) => id);
      for (const id of toDelete) {
        try {
          await Contacts.removeContactAsync(id);
        } catch (_) {}
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsApplying(false);
      await AsyncStorage.multiRemove([STORAGE_KEY, INDEX_KEY]);
    }
  }, [decisions]);

  const reset = useCallback(async () => {
    setCurrentIndex(0);
    setDecisions({});
    await AsyncStorage.multiRemove([STORAGE_KEY, INDEX_KEY]);
  }, []);

  return (
    <ContactsContext.Provider
      value={{
        contacts,
        currentIndex,
        decisions,
        permissionStatus,
        isApplying,
        isDone,
        toDeleteCount,
        swipeRight,
        swipeLeft,
        applyDeletions,
        reset,
        requestPermission,
      }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}
