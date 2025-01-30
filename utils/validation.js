const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  // Check if it's a valid phone number (adjust regex based on your needs)
  const phoneRegex = /^\d{10,}$/;
  return phoneRegex.test(cleanPhone);
};

module.exports = { validateEmail, validatePhone };
