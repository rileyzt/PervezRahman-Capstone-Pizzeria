# Pizza Store - Capstone 

 pizza ordering app.

two types of users - admin and customer. both login with email+password.


## sprint 1 
1. database schema design
2. login/register/logout working for both admin and customer
3. basic react pages - home, login, register


## database thinking

u three collections needed:

**users** - stores both admin and customer in same collection. role field tells them apart.
- name, email, password (hashed obviously), role (customer/admin), phone, address
- email should be unique - thats how they login
- password never stored as plain text, we use bcrypt to hash it

**menuitems** - all the food items
- name, description, price, category, image, available or not
- categories from the requirement: pizza, sides, beverages, combo, new launches, bestsellers
- each item linked to which admin created it

**orders** - every order placed
- which user ordered, what items (with quantities), total amount
- status tracking: pending accepted  preparing  out for delivery  delivered
- admin can also reject, customer can cancel (only if still pending)
- payment info - we're doing dummy payment with coupon code
- delivery mode - home delivery or store pickup

the collections are connected:
- orders point to users (who ordered)
- orders contain menu item references (what they ordered)
- menu items point to users (which admin added it)


## auth flow - how login works

register:
- user fills form  we check if email already taken , hash password,  save to db, generate jwt token send back

login:
- user enters email+password find user by email compare password hash  if match, generate jwt send back

logout:
- just delete the token from localstorage. thats it. jwt is stateless so nothing to do on server side.

jwt token has user id and role inside it. every api call sends this token in the header. backend middleware checks it before allowing access.

why jwt and not sessions? stateless = easier to scale. no need to store sessions on server.
why bcrypt? adds salt automatically, intentionally slow so brute force is expensive.


## frontend pages 

home page - hero banner + 6 category cards (pizza, sides, beverages, combo, new launches, bestsellers)
 login page - simple form, email + password
register page - name, email, password, confirm password, phone
-=menu page - shows items by category, search bar, add to cart button on each item
cart page - list of items with +/- quantity, total at bottom
checkout - pick delivery or pickup, enter address, place order
payment page - enter coupon code "WIPRO" to pay (dummy gateway)
order tracking - shows status timeline, admin messages
profile - view/edit user details
admin dashboard - stats cards (total orders, revenue, customers)
admin manage menu - add/edit/delete items
admin manage orders - accept/reject orders, update status, send message to customer
admin billing - generate bill for specific order
admin revenue - monthly revenue view

SPA


## api endpoints 

auth stuff:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile (privare)

menu stuff:
- GET /api/menu (browse, filter by category)
- POST /api/menu (admin adds item)
- PUT /api/menu/:id (admin edits)
- DELETE /api/menu/:id (admin deletes)
- GET /api/menu/search?q= (search by name)

order stuff:
- POST /api/orders (place order)
- GET /api/orders/my (my orders)
- PUT /api/orders/:id/cancel (cancel if pending)
- GET /api/orders (admin sees all)
- PUT /api/orders/:id/status (admin updates status + message)

payment:
- POST /api/payment/process (validate coupon code)

admin:
- GET /api/admin/revenue (monthly sales)
- GET /api/admin/bill/:orderId (generate bill)


## payment gateway 

dummy pg
- user enters coupon code at checkout
- if code is "WIPRO"  payment done, order confirmed
- anything else  invalid code, try again
- simple if-else check on backend

if couponCode === "WIPRO" then payment = success
else payment = fail


s

- react with vite 
- express for backend 
- axios for api calls from frontend 
- cors middleware (sepearate ports)


## theme

 red and black - pizza vibes
- black background
- red for buttons, headers, interactive stuff
- white text
- yellow/gold for highlights and accents
- google fonts - Inter for body, Outfit for headings


## scrutiny

- what if user registers with same email twice? check unique, show error
- what if jwt expires?  redirect to login
- what if admin tries to delete item thats in someones cart?  item has isAvailable flag
- what if customer tries to cancel already accepted order? only cancel if status is pending
- responsive design css media queries for mobile/tablet
- form validation -check empty fields, email format, password length on frontend AND backend
