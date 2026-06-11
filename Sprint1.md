# Sprint 1 — What I Did, Why I Did It, and How to Explain It


## what was the goal of sprint 1?

three things:
1. design the database schema (what data we store and how its connected)
2. build authentication — register, login, logout for both customer and admin
3. create the react frontend templates — home page, login page, register page


---


## BACKEND FILES — explained line by line


### .env — environment variables

```
MONGO_URI=mongodb+srv://...@cluster0.lw3gd8e.mongodb.net/pizzeria
JWT_SECRET=pizzeria_capstone_secret_key_2026
JWT_EXPIRE=24h
PORT=5000
COUPON_CODE=WIPRO
```

- MONGO_URI → connection string to our MongoDB Atlas cloud database. the `/pizzeria` at the end is the database name. mongoose auto-creates it on first connection.
- JWT_SECRET → a secret string used to sign JWT tokens. like a password for creating tokens. if someone knows this, they can fake tokens.
- JWT_EXPIRE → how long a login session lasts. after 24 hours, user has to login again.
- PORT → backend runs on port 5000
- COUPON_CODE → for the dummy payment gateway in sprint 3. not used yet.

**why .env file?** secrets should never be hardcoded in code. if code goes to github, secrets would be exposed. .env is in .gitignore so it never gets pushed.


---


### config/db.js — database connection

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

- `mongoose.connect()` → connects to MongoDB using the URI from .env
- `process.exit(1)` → if database connection fails, stop the server completely. no point running without a database.
- we export this function and call it in server.js

**why mongoose and not the native mongodb driver?**
mongoose gives us schema validation (define what fields are allowed), middleware hooks (like auto-hashing passwords), and `.populate()` for joining collections. native driver is more manual.


---


### models/User.js — user schema (THE MOST IMPORTANT FILE)

this file defines what a user document looks like in the database.

**the schema part:**
```js
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone:     { type: String, default: '' },
  address:   { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
```

- `required: true` → this field must be provided, otherwise mongoose throws error
- `unique: true` on email → no two users can have same email. mongoose creates a unique index.
- `lowercase: true` → auto-converts "John@Email.COM" to "john@email.com" before saving
- `trim: true` → removes extra spaces from start/end
- `enum: ['customer', 'admin']` → role can ONLY be one of these two. anything else = error.
- `default: 'customer'` → if no role is specified, it's a customer. admins are created manually or via a seed script.
- `minlength: 6` → password must be at least 6 characters

**the pre-save hook (password hashing):**
```js
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

- `pre('save')` → runs automatically BEFORE every `.save()` or `.create()` call
- `this.isModified('password')` → only hash if password changed. if user updates their name, we dont want to re-hash the already-hashed password.
- `bcrypt.genSalt(10)` → creates random salt. the number 10 means 2^10 = 1024 rounds of processing. higher = slower = more secure against brute force.
- `bcrypt.hash(password, salt)` → combines password + salt → produces a hash like `$2b$10$N9qo8u...`
- result: plain password NEVER gets stored. only the hash.

**the comparePassword method:**
```js
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

- used during login. takes the password user typed and compares it against the stored hash.
- bcrypt internally extracts the salt from the stored hash and uses it to hash the entered password, then compares.
- returns true or false.


---


### models/MenuItem.js — menu item schema

```js
category: { type: String, enum: ['pizza','sides','beverages','combo','new_launches','bestsellers'] }
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
```

- the 6 categories come directly from the PDF requirement
- `createdBy` → links to the admin who created this item. ObjectId reference = a "foreign key" in SQL terms.
- `ref: 'User'` → tells mongoose which collection this ID points to. allows us to use `.populate('createdBy')` later to get admin details.

**this file is complete but not used in sprint 1.** sprint 2 will add the CRUD routes for menu management. we built the schema now because sprint 1 objective says "create database schema along with relationships."


---


### models/Order.js — order schema

key fields:
- `user: ObjectId ref User` → who placed the order
- `items: [{ menuItem: ObjectId, name, quantity, price }]` → what they ordered. we store price as a snapshot because menu prices can change later.
- `status: enum [pending, accepted, preparing, out_for_delivery, delivered, rejected, cancelled]` → order lifecycle
- `paymentStatus: enum [pending, completed, failed]` → for dummy payment
- `couponCode: String` → stores "WIPRO" when user pays
- `deliveryMode: enum [delivery, pickup]` → from the PDF requirement

**also not used in sprint 1.** schema is ready, sprint 2 will add order placement, sprint 3 will add payment.


---


### server.js — the main entry point

```js
dotenv.config();          // load .env variables
connectDB();              // connect to mongodb
app.use(cors());          // allow frontend to call backend
app.use(express.json());  // parse JSON request bodies
app.use('/api/auth', require('./routes/authRoutes'));      // auth routes
app.use('/api/menu', require('./routes/menuRoutes'));      // menu routes (sprint 2)
app.use('/api/orders', require('./routes/orderRoutes'));   // order routes (sprint 2)
app.use('/api/payment', require('./routes/paymentRoutes'));// payment routes (sprint 3)
app.use('/api/admin', require('./routes/adminRoutes'));    // admin routes (sprint 3)
app.listen(PORT);
```

- `cors()` → Cross-Origin Resource Sharing. frontend runs on port 5173, backend on 5000. browsers block cross-port requests by default. cors allows it.
- `express.json()` → without this, req.body would be undefined. this middleware parses incoming JSON.
- each `app.use('/api/...')` mounts a group of routes. keeps server.js clean.

**why /api/ prefix?** separates API routes from frontend routes. important for vercel deployment where both run on same domain.


---


### routes/authRoutes.js — URL to function mapping

```js
router.post('/register', register);       // POST /api/auth/register
router.post('/login', login);             // POST /api/auth/login
router.get('/profile', protect, getProfile); // GET /api/auth/profile (needs token)
```

- POST for register/login because we send sensitive data (password) in request body. GET puts data in URL which is visible in browser history.
- `protect` middleware runs BEFORE `getProfile`. it verifies the JWT token first.


---


### controllers/authController.js — the actual logic

**register function:**
1. get name, email, password, phone from req.body
2. check if email already exists → if yes, return 400 error
3. create user with `User.create()` → password auto-hashes via pre-save hook
4. generate JWT token with user's id and role
5. return token + user info

**login function:**
1. get email, password from req.body
2. find user by email → if not found, return 401 "invalid email or password"
3. compare password using `user.comparePassword()` → if wrong, return 401
4. same error message for both "email not found" and "wrong password" — security practice. dont tell attackers which one is wrong.
5. generate JWT token, return it

**getProfile function:**
1. req.user was set by the protect middleware
2. find user by id, exclude password field with `.select('-password')`
3. return user data


---


### middleware/authMiddleware.js — JWT verification

```js
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) → return 401
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');
  next();
};
```

- frontend sends token as: `Authorization: Bearer eyJhbG...`
- we split by space to get just the token part
- `jwt.verify()` checks if the token was signed with our secret and hasn't expired
- `decoded` contains `{ id, role }` that we put in when creating the token
- we find the user and attach to `req.user` so the next function (controller) knows who is making the request
- `next()` passes control to the next middleware or route handler


---


### middleware/roleMiddleware.js — admin check

```js
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};
```

- runs AFTER authMiddleware (so req.user is already set)
- simple if-else: is the user an admin? yes → proceed. no → 403 forbidden.
- **not actively used in sprint 1** but ready for sprint 2 when admin CRUD on menu is built.


---


### utils/generateToken.js

```js
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};
```

- `jwt.sign()` creates a token with payload `{ id, role }`
- signed with our secret key
- expires in 24 hours
- used in both register and login controllers — thats why its a separate utility (DRY principle)


---


### utils/validators.js

- `validateEmail()` → regex check for email format
- `validatePassword()` → checks minimum 6 characters
- `validatePhone()` → checks 10-digit indian phone number

**server-side validation** even though frontend also validates. why? someone can bypass frontend using postman or curl and send garbage data directly to the API.


---


## FRONTEND FILES — explained


### index.css — design system

- defines the color theme: deep black (#0A0A0A), netflix red (#E50914), white text
- google fonts: Inter for body text, Outfit for headings
- resets browser defaults (margin, padding, box-sizing)
- defines status badge styles for orders (used in sprint 2/3)


### App.jsx — router setup

- wraps everything in `AuthProvider` (so auth state is available everywhere)
- defines ALL routes (sprint 1, 2, 3) — sprint 2/3 pages show placeholder TODO text for now
- public routes: /, /login, /register, /menu
- protected routes (need login): /cart, /checkout, /payment, /orders, /profile
- admin routes (need login + admin role): /admin, /admin/menu, /admin/orders, /admin/revenue


### context/AuthContext.jsx — global auth state

- stores: user, token, loading, isAuthenticated
- on app load: checks if token exists in localStorage → if yes, verifies it with the server
- `login()` → calls API → saves token to localStorage → sets user state
- `register()` → calls API → saves token to localStorage → sets user state
- `logout()` → removes token from localStorage → sets user to null
- `useAuth()` custom hook → shortcut for any component to access auth state


### services/api.js — axios setup

- creates axios instance with baseURL `http://localhost:5000/api`
- **interceptor** → automatically adds `Authorization: Bearer <token>` header to every request. without this, we'd have to manually add the header in every API call.
- exports functions for every API endpoint (auth, menu, orders, payment, admin)
- sprint 2/3 endpoints are already defined here but the backend controllers are empty (TODO)


### pages/Home.jsx

- hero section: bold text "Delicious Pizza, Delivered Fast." + red "Order Now" button
- 6 category cards in a 3x2 grid: pizza, sides, beverages, combo, new launches, bestsellers
- each card links to /menu/:category (will work in sprint 2)
- "Why Pizzeria?" stats section: 30 min delivery, 50+ items, 10K+ customers
- hover effect on cards: border turns red, card lifts up


### pages/Login.jsx

- two input fields: email, password
- simple if-else validation before submitting
- calls `login()` from AuthContext
- on success: redirects admin to /admin, customer to /
- on error: shows error message in red box


### pages/Register.jsx

- five input fields: name, email, password, confirm password, phone
- validation: checks empty fields, password length, password match
- calls `register()` from AuthContext
- on success: auto-login and redirect to home


### components/Navbar.jsx

- shows PIZZERIA logo (links to home)
- if NOT logged in → shows: Home, Menu, Sign In, Get Started
- if logged in → shows: Home, Menu, Cart, Orders, username, Logout
- if admin → also shows "Admin" link in gold color
- fixed at top with blur background


### components/Footer.jsx

- PIZZERIA brand name in red
- tagline: "Fresh. Hot. Delivered."
- copyright line


### components/ProtectedRoute.jsx

- wraps pages that need login
- checks `isAuthenticated` from AuthContext
- if not logged in → redirects to /login
- if still loading (checking token) → shows "Loading..."


### components/AdminRoute.jsx

- wraps admin-only pages
- checks if logged in AND role is 'admin'
- not logged in → redirect to /login
- logged in but not admin → redirect to /


---


## WHAT'S DONE vs WHAT'S LEFT

| Thing | Sprint 1 Status | When it completes |
|-------|----------------|-------------------|
| User schema | done | — |
| MenuItem schema | done (schema only) | sprint 2 adds CRUD routes |
| Order schema | done (schema only) | sprint 2 adds order routes |
| Register | done, working | — |
| Login | done, working | — |
| Logout | done, working | — |
| JWT auth middleware | done, working | — |
| Admin role middleware | done (code ready) | sprint 2 uses it for menu CRUD |
| Home page | done | — |
| Login page | done | — |
| Register page | done | — |
| Navbar | done | — |
| Footer | done | — |
| Menu page | placeholder | sprint 2 |
| Cart page | placeholder | sprint 2 |
| Admin dashboard | placeholder | sprint 3 |
| Payment gateway | placeholder | sprint 3 |
| Menu CRUD (admin) | routes exist, controller is TODO | sprint 2 |
| Order management | routes exist, controller is TODO | sprint 2/3 |
| Revenue/billing | routes exist, controller is TODO | sprint 3 |


---


## QUESTIONS A SENIOR ENGINEER WOULD ASK (AND HOW TO ANSWER)


### on database design

**Q: Why did you put admin and customer in the same collection instead of separate collections?**
A: Both share the same fields — name, email, password. A `role` field differentiates them. Separate collections would mean duplicate authentication logic. Single collection, single login endpoint, single token generation. Simpler and scales the same way.

**Q: Why ObjectId references between collections instead of embedding?**
A: If I embed orders inside the user document, it grows unbounded. MongoDB has a 16MB document limit. With references, each order is its own document. I can query orders independently, paginate them, and the user document stays lean. For the order items, I do a hybrid — I store the price snapshot inside the order (denormalized) so the bill stays accurate even if menu prices change later.

**Q: Why store the price in the order item instead of just referencing the menu item?**
A: Price snapshot. If admin changes a pizza from 299 to 349 tomorrow, old orders should still show the original 299 that the customer paid. Referencing the menu item and looking up current price would give wrong bill amounts.

**Q: What indexes does your schema have?**
A: Email has a `unique: true` which creates a unique index. This speeds up login queries (we always find by email) and prevents duplicates at the database level, not just application level. MongoDB also auto-creates an index on `_id`.


### on authentication

**Q: Why same error message for "email not found" and "wrong password"?**
A: Security. If I say "email not found", an attacker learns which emails exist in my system. They can use this for targeted phishing or password attacks. Generic "invalid email or password" reveals nothing.

**Q: What happens if someone steals a JWT token?**
A: They can impersonate the user until the token expires (24 hours). Mitigations in production: shorter expiry (15 min) with a refresh token, httpOnly cookies instead of localStorage (prevents XSS from reading the token), and token blacklisting on logout.

**Q: Why localStorage for token instead of httpOnly cookies?**
A: The project requirement explicitly says "Handle Session using Local Storage." In production, httpOnly cookies are more secure because JavaScript cannot access them — protects against XSS attacks. LocalStorage is readable by any JS on the page.

**Q: JWT is stateless — how would you forcefully log someone out?**
A: Maintain a token blacklist in Redis or the database. On logout, add the token's `jti` (unique token ID) to the blacklist. The auth middleware checks the blacklist before allowing access. Trade-off: adds a database lookup per request, partially defeating the "stateless" benefit.

**Q: Why bcrypt and not SHA256 or MD5?**
A: SHA256 and MD5 are designed to be FAST. That's bad for passwords because attackers can try billions of hashes per second. bcrypt is intentionally SLOW (configurable via salt rounds). At 10 rounds, it takes ~100ms per hash. Makes brute-force impractical. Also, bcrypt adds a random salt automatically — two users with the same password get different hashes.

**Q: What does the `10` in `bcrypt.genSalt(10)` mean?**
A: It's the cost factor. The number of rounds is 2^10 = 1024 iterations. Higher number = slower hashing = more secure but uses more CPU. 10 is the industry standard balance. Companies like GitHub use 10-12.


### on architecture

**Q: Why separate routes, controllers, and middleware into different files?**
A: Separation of concerns. Routes define URLs. Controllers handle business logic. Middleware handles cross-cutting concerns (auth, validation). I can unit test a controller without starting the HTTP server. I can swap out auth middleware without touching any controller. Each file has one job.

**Q: Why is the API prefix /api/?**
A: In production on Vercel, frontend and backend share the same domain. `/api/` separates backend routes from frontend routes. Vercel routes `/api/*` to serverless functions and everything else to the React SPA. Without this prefix, there could be URL conflicts.

**Q: Why axios over fetch?**
A: Interceptors. I set up one interceptor that automatically attaches the JWT token to every request. With fetch, I'd have to manually add the Authorization header in every single API call. Also, axios auto-rejects on 4xx/5xx status codes — fetch considers them successful responses and you have to check `response.ok` manually.

**Q: Why React Context instead of Redux for auth state?**
A: Auth state is simple — just user object, token, and a boolean. Three functions: login, register, logout. Redux adds boilerplate: store setup, action creators, reducers, dispatch calls. For this complexity level, Context is sufficient and has zero extra dependencies. If the app grows (like real-time cart sync across tabs), Redux or Zustand would make sense.


### on frontend

**Q: Why inline styles instead of CSS modules or styled-components?**
A: Readability. Every style is right next to the JSX that uses it. A reviewer can see what a component looks like without jumping to a separate CSS file. For a capstone project of this size, it keeps things simple and self-contained. In a larger app, I'd use CSS modules for better organization and caching.

**Q: How does the ProtectedRoute work?**
A: It's a wrapper component. In App.jsx, I wrap protected pages like `<ProtectedRoute><Cart /></ProtectedRoute>`. The wrapper checks `isAuthenticated` from AuthContext. If true, it renders the child (Cart). If false, it redirects to /login using React Router's `<Navigate>`. This avoids repeating the auth check inside every protected page.

**Q: What's the difference between `useEffect` with `[]` and without?**
A: Empty array `[]` means "run once when component mounts." No array means "run after every render." In AuthContext, I use `[]` to check the token only once when the app first loads — not on every state update, which would cause infinite loops.


### on security

**Q: What security vulnerabilities exist in this setup?**
A: Three main ones: (1) localStorage is vulnerable to XSS — any script injected into the page can steal the token. (2) No CSRF protection — but since we use Bearer tokens not cookies, CSRF is not applicable. (3) No rate limiting on login — an attacker could brute-force passwords. In production, I'd add rate limiting with `express-rate-limit` and use httpOnly cookies.

**Q: How would you make this production-ready?**
A: Five things: (1) HTTPS everywhere. (2) httpOnly cookies for tokens instead of localStorage. (3) Rate limiting on auth endpoints. (4) Input sanitization to prevent NoSQL injection (use `express-mongo-sanitize`). (5) Helmet.js for security headers. (6) Refresh token rotation for session management.


### on deployment

**Q: How will you deploy this on Vercel?**
A: Frontend deploys as a static Vite build — Vercel auto-detects it. Backend deploys as serverless functions using `vercel.json` config that routes `/api/*` to `server.js`. The MongoDB Atlas connection string stays in Vercel environment variables (not in code). CORS config changes from `localhost` to the actual domain.

**Q: Why MongoDB Atlas instead of local MongoDB for this project?**
A: Local MongoDB only works on my machine. Atlas is cloud-hosted — works from anywhere and survives deployments. Vercel serverless functions can't connect to localhost. Atlas also provides free tier with 512MB storage — enough for a capstone.
