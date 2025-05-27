import { AuthResponse, User } from '../types/auth';

export interface UserRepository {
  getUser(): Promise<User | null>;
  signIn(credentials: { email: string; password: string }): Promise<AuthResponse>;
  signOut(): Promise<{ error: any | null }>;
  onAuthStateChange(callback: (event: string, session: any) => void): { subscription: { unsubscribe: () => void } };
  transformUser(rawUser: any): User | null;
}