export const tokenService = {
  get: () => {
    return localStorage.getItem('authToken');
  },

  set: (token: string) => {
    localStorage.setItem('authToken', token);
  },

  remove: () => {
    localStorage.removeItem('authToken');
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