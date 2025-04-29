import { setCookie, getCookie, deleteCookie } from 'cookies-next';

export const tokenService = {
  get: () => {
    return typeof window !== 'undefined' 
      ? localStorage.getItem('authToken') || getCookie('authToken')
      : getCookie('authToken');
  },

  set: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    setCookie('authToken', token, {
      maxAge: 60 * 60,
      path: '/'
    });
  },

  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    deleteCookie('authToken');
  },

  isValid: () => {
    const token = tokenService.get();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}; 