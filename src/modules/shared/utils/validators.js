export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

export const isValidUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};