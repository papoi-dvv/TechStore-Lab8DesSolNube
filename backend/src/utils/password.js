const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return passwordRegex.test(password);
}

module.exports = {
  validatePassword,
};
