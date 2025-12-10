// frontend/lib/auth.ts
// Client API d'authentification - À utiliser à la place de Supabase

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

interface AuthResponse {
  user: {
    id: string;
    email: string;
    pseudo: string;
    firstName?: string;
    lastName?: string;
    role: 'admin' | 'coach' | 'student';
    profileUrl?: string;
  };
  access_token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  pseudo: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'coach' | 'student';
}

class AuthClient {
  private tokenKey = 'access_token';
  private userKey = 'user_data';

  /**
   * Make API request
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization token if available
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 401) {
      this.logout();
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Créer un nouveau compte
   */
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('POST', '/auth/signup', data);
    
    // Sauvegarder le token et les données utilisateur
    this.setToken(response.access_token);
    this.setUser(response.user);
    this.setUserRole(response.user.role);
    
    return response;
  }

  /**
   * Se connecter avec email et mot de passe
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('POST', '/auth/login', credentials);
    
    // Sauvegarder le token et les données utilisateur
    this.setToken(response.access_token);
    this.setUser(response.user);
    this.setUserRole(response.user.role);
    
    return response;
  }

  /**
   * Récupérer les données de l'utilisateur connecté
   */
  async getCurrentUser() {
    const response = await this.request<any>('GET', '/auth/me');
    
    // Mettre à jour les données utilisateur
    this.setUser(response);
    
    return response;
  }

  /**
   * Se déconnecter
   */
  logout(): void {
    this.removeToken();
    this.removeUser();
  }

  /**
   * Décoder le JWT token pour obtenir le payload
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const decoded = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      return decoded;
    } catch (error) {
      console.error('[Auth] Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Vérifier si le token a expiré
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      // exp est en secondes, Date.now() est en millisecondes
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const isExpired = now > expiryTime;
      
      if (isExpired) {
        console.log('[Auth] Token expired at:', new Date(expiryTime).toISOString());
      }
      return isExpired;
    } catch (error) {
      console.error('[Auth] Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Vérifier si l'utilisateur est connecté ET son token est valide
   */
  isAuthenticated(): boolean {
    const hasToken = !!this.getToken();
    if (!hasToken) return false;
    
    // Si le token a expiré, le supprimer et retourner false
    if (this.isTokenExpired()) {
      console.log('[Auth] Logging out - token expired');
      this.logout();
      return false;
    }
    
    return true;
  }

  /**
   * Récupérer le token stocké
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Sauvegarder le token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Supprimer le token
   */
  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  /**
   * Récupérer les données utilisateur stockées
   */
  getUser() {
    if (typeof window === 'undefined') return null;
    const userString = localStorage.getItem(this.userKey);
    return userString ? JSON.parse(userString) : null;
  }

  /**
   * Sauvegarder les données utilisateur
   */
  private setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Supprimer les données utilisateur
   */
  private removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.userKey);
    }
  }

  /**
   * Sauvegarder le rôle utilisateur
   */
  private setUserRole(role: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
  }

  /**
   * Récupérer le rôle utilisateur
   */
  getUserRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userRole');
  }

  /**
   * Forcer l'invalidation du token (pour les tests)
   */
  invalidateToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      console.log('[Auth] Token invalidated for testing');
    }
  }
}

// Export une instance unique
export const authClient = new AuthClient();

// Export les types
export type { AuthResponse, LoginCredentials, SignupData };
