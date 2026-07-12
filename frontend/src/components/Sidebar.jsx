import {
  LayoutDashboard,
  Users,
  Briefcase,
  MessageSquare,
  FileText,
  Timer,
  History,
  Settings,
} from "lucide-react";

import "./Sidebar.css";

const menus = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    icon: Users,
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
    title: "Settings",
    icon: Settings,
  },
];

function Sidebar({ active, setActive }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        {/* <div className="logo-icon">JT</div> */}

        <div className="brand-info">
          <h2>CRM</h2>

          <span>Workforce Management</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menus.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              className={`menu-item ${active === item.title ? "active" : ""}`}
              onClick={() => setActive(item.title)}
            >
              <Icon size={19} />

              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
