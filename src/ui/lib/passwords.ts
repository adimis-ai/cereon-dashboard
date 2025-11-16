export const generateRandomPassword = () => {
  const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
  const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = '!@#$%^&*(),.?":{}|<>';
  const allChars = lowerCaseChars + upperCaseChars + numbers + specialChars;

  let password = "";

  password += lowerCaseChars.charAt(
    Math.floor(Math.random() * lowerCaseChars.length)
  );
  password += upperCaseChars.charAt(
    Math.floor(Math.random() * upperCaseChars.length)
  );
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += specialChars.charAt(
    Math.floor(Math.random() * specialChars.length)
  );

  while (password.length < 16) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

export const evaluatePasswordCriteria = (password: string) => {
  const errors: string[] = [];
  if (password.length < 16)
    errors.push("Password must be at least 16 characters.");
  if (!/[a-z]/.test(password))
    errors.push("Password must include at least one lowercase letter.");
  if (!/[A-Z]/.test(password))
    errors.push("Password must include at least one uppercase letter.");
  if (!/[0-9]/.test(password))
    errors.push("Password must include at least one number.");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    errors.push("Password must include at least one special character.");
  return errors;
};
