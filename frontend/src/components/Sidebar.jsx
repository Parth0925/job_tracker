import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  FileText,
  Timer,
  History,
  Settings,
  ChevronRight,
  Network,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./Sidebar.css";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employee Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    icon: Users,
  },
  {
    title: "Organisation",
    icon: Network,
  },
  {
    title: "Jobs",
    icon: Briefcase,
  },
  {
    title: "Messages",
    icon: MessageSquare,
  },
  {
    title: "Reports",
    icon: FileText,
  },
  {
    title: "Timers",
    icon: Timer,
  },
  {
    title: "Work History",
    icon: History,
  },
  {
    title: "Configurations",
    icon: Settings,
  },
];

function Sidebar({ active, setActive }) {
  const { user } = useAuth();

  const activeRole = user?.activeRole;

  const allowedPages = activeRole?.pagePermissions || [];

  const visibleMenus = menus.filter((item) =>
    allowedPages.includes(item.title),
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark">CRM</div>

        <div className="brand-info">
          {/* <h2>CRM</h2> */}
          <span>Workforce Management</span>
        </div>
      </div>

      <div className="sidebar-section-label">MAIN MENU</div>

      <nav className="sidebar-menu">
        {visibleMenus.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.title;

          return (
            <button
              key={item.title}
              type="button"
              className={`menu-item ${isActive ? "active" : ""}`}
              onClick={() => setActive(item.title)}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="menu-icon">
                <Icon size={19} strokeWidth={isActive ? 2.4 : 2} />
              </span>

              <span className="menu-label">{item.title}</span>

              {isActive && (
                <ChevronRight
                  className="menu-arrow"
                  size={16}
                  strokeWidth={2.5}
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-line"></div>

        {/* <span>CRM</span> */}
        {/* <small>Workforce Management</small> */}
      </div>
    </aside>
  );
}

export default Sidebar;
