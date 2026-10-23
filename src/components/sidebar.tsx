import { UnstyledButton } from "@mantine/core";

import logo from "../assets/brand/logo.png";
import styles from "./sidebar.module.css";

type SidebarProps = {
  activePage: string;
  onPageChange: (page: string) => void;
};

type NavigationIconProps = {
  name: "dashboard" | "projects" | "settings";
};

function NavigationIcon({ name }: NavigationIconProps) {
  const paths = {
    dashboard: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
    projects: <path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M3 10h18" />,
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M10 2h4l.6 2.4 2.2 1.2 2.3-.8 2 3.5-1.7 1.7v2.5l1.7 1.7-2 3.5-2.3-.8-2.2 1.2L14 22h-4l-.6-2.4-2.2-1.2-2.3.8-2-3.5 1.7-1.7v-2.5L2.9 9l2-3.5 2.3.8 2.2-1.2z" />
      </>
    ),
  };

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const activeNavigation =
    activePage === "project-registration" || activePage === "project-detail"
      ? "projects"
      : activePage;

  const entries = [
    { id: "dashboard", label: "Dashboard" },
    { id: "projects", label: "Projects" },
    { id: "settings", label: "Settings" },
  ] as const;

  return (
    <aside className="sidebar">
      <div className={styles.logo}>
        <img className={styles.logoImage} src={logo} alt="" />
        <span className={styles.logoText}>CostPilot</span>
      </div>

      <nav className={styles.navigation} aria-label="Main navigation">
        {entries.map((entry) => (
          <UnstyledButton
            key={entry.id}
            className={styles.navButton}
            data-active={activeNavigation === entry.id ? "true" : undefined}
            aria-current={activeNavigation === entry.id ? "page" : undefined}
            aria-label={entry.label}
            onClick={() => onPageChange(entry.id)}
          >
            <span className={styles.navIcon}>
              <NavigationIcon name={entry.id} />
            </span>
            <span className={styles.navLabel}>{entry.label}</span>
          </UnstyledButton>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
