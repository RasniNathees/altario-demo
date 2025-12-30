import { NavLink, useLocation } from "react-router-dom"
import React from "react"

type NavItemProps = {
  to: string
  icon: React.ElementType
  children?: React.ReactNode
  view: "desktop" | "mobile"
}

export const NavItem = ({ to, icon: Icon, children, view }: NavItemProps) => {
  const location = useLocation()

  const isActive =
    location.pathname === to ||
    (to !== "/" && location.pathname.startsWith(to))

  const linkClass =
    view === "desktop"
      ? `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
          isActive
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`
      : `p-2 rounded-full transition ${
          isActive ? "bg-slate-100 text-primary" : "text-slate-500"
        }`

  const iconClass =
    view === "desktop"
      ? `h-4 w-4 ${
          isActive
            ? "text-primary-foreground"
            : "text-slate-500 group-hover:text-slate-900"
        }`
      : "h-5 w-5"

  return (
    <NavLink to={to} className={linkClass}>
      <Icon className={iconClass} />
      {view === "desktop" && (
        <span className="font-medium text-sm">{children}</span>
      )}
    </NavLink>
  )
}

export default NavItem
