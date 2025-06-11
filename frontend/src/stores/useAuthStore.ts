import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Merchant, Admin, UserType } from '@/types';

// 联合用户类型
type AuthUser = User | Merchant | Admin;

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  userType: UserType | null;
  token: string | null;
  isInitialized: boolean;
  
  // Actions
  login: (token: string, user: AuthUser, userType: UserType) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  checkAuthStatus: (expectedUserType?: UserType) => boolean;
  clearInvalidAuth: () => void;
  initialize: (expectedUserType?: UserType) => void;
  getCurrentUserType: () => UserType | null;
}

// 获取当前路径对应的用户类型
const getUserTypeFromPath = (): UserType | null => {
  const path = window.location.pathname;
  if (path.startsWith('/user')) return 'user';
  if (path.startsWith('/merchant')) return 'merchant';
  if (path.startsWith('/admin')) return 'admin';
  return null;
};

// 获取用户类型特定的localStorage键
const getStorageKeys = (userType: UserType) => ({
  token: `${userType}_token`,
  userInfo: `${userType}_userInfo`,
  userType: `${userType}_userType`,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      userType: null,
      token: null,
      isInitialized: false,

      login: (token: string, user: AuthUser, userType: UserType) => {
        const keys = getStorageKeys(userType);
        
        // 清除其他用户类型的认证信息
        const allUserTypes: UserType[] = ['user', 'merchant', 'admin'];
        allUserTypes.forEach(type => {
          if (type !== userType) {
            const otherKeys = getStorageKeys(type);
            localStorage.removeItem(otherKeys.token);
            localStorage.removeItem(otherKeys.userInfo);
            localStorage.removeItem(otherKeys.userType);
          }
        });
        
        // 设置当前用户类型的认证信息
        localStorage.setItem(keys.token, token);
        localStorage.setItem(keys.userInfo, JSON.stringify(user));
        localStorage.setItem(keys.userType, userType);
        
        set({
          isAuthenticated: true,
          user,
          userType,
          token,
          isInitialized: true,
        });
      },

      logout: () => {
        const currentUserType = get().userType;
        if (currentUserType) {
          const keys = getStorageKeys(currentUserType);
          localStorage.removeItem(keys.token);
          localStorage.removeItem(keys.userInfo);
          localStorage.removeItem(keys.userType);
        }
        
        set({
          isAuthenticated: false,
          user: null,
          userType: null,
          token: null,
          isInitialized: true,
        });
      },

      updateUser: (user: AuthUser) => {
        const currentUserType = get().userType;
        if (currentUserType) {
          const keys = getStorageKeys(currentUserType);
          localStorage.setItem(keys.userInfo, JSON.stringify(user));
        }
        set({ user });
      },

      getCurrentUserType: () => {
        return getUserTypeFromPath();
      },

      // 初始化认证状态（应用启动时调用）
      initialize: (expectedUserType?: UserType) => {
        const pathUserType = expectedUserType || getUserTypeFromPath();
        const isValid = pathUserType ? get().checkAuthStatus(pathUserType) : false;
        set({ isInitialized: true });
        return isValid;
      },

      // 检查认证状态是否有效
      checkAuthStatus: (expectedUserType?: UserType) => {
        const state = get();
        const pathUserType = expectedUserType || getUserTypeFromPath();
        
        // 如果没有明确的用户类型上下文，认为未登录
        if (!pathUserType) {
          if (state.isAuthenticated) {
            set({
              isAuthenticated: false,
              user: null,
              userType: null,
              token: null,
            });
          }
          return false;
        }

        const keys = getStorageKeys(pathUserType);
        const token = localStorage.getItem(keys.token);
        const userType = localStorage.getItem(keys.userType);
        
        // 检查是否有对应用户类型的认证信息
        if (!token || !userType || userType !== pathUserType) {
          if (state.isAuthenticated) {
            set({
              isAuthenticated: false,
              user: null,
              userType: null,
              token: null,
            });
          }
          return false;
        }

        // 验证token格式
        try {
          if (!token || token.length < 10) {
            console.log('Invalid token detected for', pathUserType);
            get().clearInvalidAuth();
            return false;
          }
        } catch (error) {
          console.error('Token validation error:', error);
          get().clearInvalidAuth();
          return false;
        }

        // 检查用户信息是否存在
        try {
          const userInfo = localStorage.getItem(keys.userInfo);
          
          if (!userInfo) {
            get().clearInvalidAuth();
            return false;
          }

          // 如果store中没有用户信息但localStorage有，恢复状态
          if (!state.user || !state.isAuthenticated || state.userType !== pathUserType) {
            const userData = JSON.parse(userInfo);
            set({
              isAuthenticated: true,
              user: userData,
              userType: pathUserType,
              token,
            });
          }

          return true;
        } catch (error) {
          console.error('User info validation error:', error);
          get().clearInvalidAuth();
          return false;
        }
      },

      // 清理无效的认证状态
      clearInvalidAuth: () => {
        const pathUserType = getUserTypeFromPath();
        if (pathUserType) {
          const keys = getStorageKeys(pathUserType);
          localStorage.removeItem(keys.token);
          localStorage.removeItem(keys.userInfo);
          localStorage.removeItem(keys.userType);
        }
        
        set({
          isAuthenticated: false,
          user: null,
          userType: null,
          token: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: () => ({
        // 不持久化认证状态，每次刷新都重新验证
        isAuthenticated: false,
        user: null,
        userType: null,
        token: null,
        isInitialized: false,
      }),
    }
  )
); 