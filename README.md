# FinTrack — Module 1: Auth, Profile, Admin

Runs on its own, and can be copied into the main team project.

## Run
    npm install
    npx prisma migrate dev --name init
    npm start
Open http://localhost:3000  (the first user to register becomes admin)

## Features
- Register (name, email, password) with validation
- Login with JWT token (valid 7 days)
- Passwords stored as bcrypt hash
- Profile: view details, update name, change password, delete own account
- Admin: stats, search users, make admin/user, delete user
- Protection: normal users get "403 Admin only" on admin routes

## Files
    routes/auth.js         register, login, profile, password, delete account
    routes/admin.js        admin APIs
    middleware/auth.js     checks the login token
    middleware/admin.js    checks the admin role
    public/index.html      login + register page
    public/profile.html    profile page
    public/admin.html      admin page

## How the login works (for viva)
1. User registers -> password is hashed with bcrypt -> saved in the database
2. User logs in -> bcrypt compares password -> server creates a JWT token
3. Browser saves the token (localStorage) and sends it with every request
4. middleware/auth.js verifies the token on each protected route
5. middleware/admin.js checks the role in the database for admin routes

## Join with the main project
Copy these into the main project (same names): routes/auth.js, routes/admin.js,
middleware/auth.js, middleware/admin.js, lib/prisma.js and the User model in schema.prisma.
