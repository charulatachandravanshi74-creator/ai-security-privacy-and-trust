import type {
  User,
  SecurityScan,
  ComplianceAudit,
  DashboardStats,
  ComplianceFramework
} from '../types/index.ts';

const TOKEN_KEY = 'trustshield_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (data.details ? data.details.map((d: any) => d.message).join(', ') : 'Request failed');
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    async register(payload: { email: string; password: string; fullName: string; role?: string }): Promise<{ token: string; user: User }> {
      return request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    async login(payload: { email: string; password: string }): Promise<{ token: string; user: User }> {
      return request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    async getMe(): Promise<{ user: User }> {
      return request<{ user: User }>('/api/auth/me');
    }
  },

  security: {
    async runScan(payload: { scanType: string; inputContent: string }): Promise<{ scan: SecurityScan }> {
      return request<{ scan: SecurityScan }>('/api/security/scan', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    async getScans(): Promise<{ scans: SecurityScan[] }> {
      return request<{ scans: SecurityScan[] }>('/api/security/scans');
    },
    async quickRedact(content: string): Promise<{ sanitized: string; pii: any[] }> {
      return request<{ sanitized: string; pii: any[] }>('/api/security/quick-redact', {
        method: 'POST',
        body: JSON.stringify({ content })
      });
    }
  },

  compliance: {
    async runAssessment(payload: { framework: ComplianceFramework; scopeDescription: string }): Promise<{ audit: ComplianceAudit }> {
      return request<{ audit: ComplianceAudit }>('/api/compliance/assess', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    async getReports(): Promise<{ audits: ComplianceAudit[] }> {
      return request<{ audits: ComplianceAudit[] }>('/api/compliance/reports');
    }
  },

  dashboard: {
    async getStats(): Promise<DashboardStats> {
      return request<DashboardStats>('/api/dashboard/stats');
    }
  },

  audits: {
    getExportUrl(format: 'json' | 'csv'): string {
      const token = authStorage.getToken();
      return `/api/audits/export?format=${format}&token=${encodeURIComponent(token || '')}`;
    },
    async downloadExport(format: 'json' | 'csv'): Promise<void> {
      const token = authStorage.getToken();
      const response = await fetch(`/api/audits/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trustshield_audit_export_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
};
