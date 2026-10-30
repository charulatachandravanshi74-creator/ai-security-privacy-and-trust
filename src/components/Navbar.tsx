import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Shield,
  Scan,
  LayoutDashboard,
  FileCheck2,
  ScrollText,
  Settings,
  LogOut,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import type { UserRole } from '../types/index.ts';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (role: UserRole) => {
    setIsDemoMenuOpen(false);
    await quickLogin(role);
    navigate('/dashboard');
  };

  const navLinks = [
    { label: 'Overview', path: '/' },
    ...(user
      ? [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'AI Scanner', path: '/scanner', icon: Scan },
          { label: 'Assessments', path: '/assessments', icon: FileCheck2 },
          { label: 'Audit Logs', path: '/audits', icon: ScrollText },
          { label: 'Settings', path: '/settings', icon: Settings }
        ]
      : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-md shadow-cyan-950 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                TrustShield <span className="text-cyan-400">AI</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                Security & Privacy Sentinel
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Engine Status Tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sentinel Live</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/scanner"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-sm transition-all"
              >
                <Zap size={14} />
                <span>New Scan</span>
              </Link>

              {/* Demo Role Switcher */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                  title="Switch Demo Role for testing"
                >
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Role: {user.role}</span>
                  <ChevronDown size={13} />
                </button>

                {isDemoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-900 shadow-xl py-2 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Switch Role (Demo Mode)
                    </div>
                    {(['Admin', 'Auditor', 'Developer'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSwitch(r)}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          user.role === r ? 'text-cyan-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <span>{r} View</span>
                        {user.role === r && <span className="text-[10px] text-cyan-400 font-bold">Active</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <LayoutDashboard size={14} />
                      <span>Security Telemetry</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <Settings size={14} />
                      <span>Security Settings</span>
                    </Link>

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm shadow-cyan-950 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.path)
                  ? 'text-cyan-400 bg-cyan-950/50'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg border border-slate-800 text-sm font-medium text-slate-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
