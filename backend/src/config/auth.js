export default {
  secret: process.env.JWT_SECRET || 'maiscargo-secret-key',
  expiresIn: '7d',
}; 