const bcrypt = require('bcryptjs');
const start = Date.now();
bcrypt.hash('password123', 10).then(hash => {
  console.log('Hash time:', Date.now() - start);
  const start2 = Date.now();
  bcrypt.compare('password123', hash).then(res => {
    console.log('Compare time:', Date.now() - start2);
  });
});
