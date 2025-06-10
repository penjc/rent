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
  isInitialized: boolean; // 添加初始化状态标识
  
  // Actions
  login: (token: string, user: AuthUser, userType: UserType) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  checkAuthStatus: () => boolean;
  clearInvalidAuth: () => void;
  initialize: () => void; // 添加初始化方法
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      userType: null,
      token: null,
      isInitialized: false,

      login: (token: string, user: AuthUser, userType: UserType) => {
        localStorage.setItem('token', token);
        // 根据用户类型保存到对应的localStorage
        if (userType === 'user') {
          localStorage.setItem('userInfo', JSON.stringify(user));
        } else if (userType === 'merchant') {
          localStorage.setItem('merchantInfo', JSON.stringify(user));
        } else if (userType === 'admin') {
          localStorage.setItem('adminInfo', JSON.stringify(user));
        }
        localStorage.setItem('userType', userType);
        
        set({
          isAuthenticated: true,
          user,
          userType,
          token,
          isInitialized: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('merchantInfo');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('userType');
        set({
          isAuthenticated: false,
          user: null,
          userType: null,
          token: null,
          isInitialized: true,
        });
      },

      updateUser: (user: AuthUser) => {
        set({ user });
      },

      // 初始化认证状态（应用启动时调用）
      initialize: () => {
        const isValid = get().checkAuthStatus();
        set({ isInitialized: true });
        return isValid;
      },

      // 检查认证状态是否有效
      checkAuthStatus: () => {
        const state = get();
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        // 如果没有token或userType，认为未登录
        if (!token || !userType) {
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

        // 检查token是否过期（这里可以添加更复杂的验证逻辑）
        try {
          // 检查token格式，实际项目中应该验证JWT
          if (!token || token.length < 10) {
            // 如果是无效token，需要重新登录
            console.log('Invalid token detected, clearing auth state');
            get().clearInvalidAuth();
            return false;
          }
          
          // 检查是否是旧的fake-token，如果是则清理状态
          if (token === 'fake-token') {
            console.log('Fake token detected, clearing auth state');
            get().clearInvalidAuth();
            return false;
          }
        } catch (error) {
          console.error('Token validation error:', error);
          get().clearInvalidAuth();
          return false;
        }

        // 检查用户信息是否存在
        let userInfo = null;
        try {
          if (userType === 'user') {
            userInfo = localStorage.getItem('userInfo');
          } else if (userType === 'merchant') {
            userInfo = localStorage.getItem('merchantInfo');
          } else if (userType === 'admin') {
            userInfo = localStorage.getItem('adminInfo');
          }

          if (!userInfo) {
            get().clearInvalidAuth();
            return false;
          }

          // 如果store中没有用户信息但localStorage有，恢复状态
          if (!state.user || !state.isAuthenticated) {
            const userData = JSON.parse(userInfo);
            set({
              isAuthenticated: true,
              user: userData,
              userType: userType as UserType,
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
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('merchantInfo');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('userType');
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