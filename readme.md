**Natours** is a comprehensive web application that enables to sign up users, change users password and other data, book tours and check booked tours on 'my bookings' page. The application includes multiple routes, admin routes, user authentication via JWT and cookie storage, and a payment page powered by Stripe. Additionally, the application has a custom back-end API with sorting, finding, and pagination capabilities.#

You can check out my app on https://natoursafanasiev.herokuapp.com/ Later it will be redeployed on Cyclic and link will be updated

### Images
![Image1](docs/media/img1.jpg)
![Image1](docs/media/img2.jpg)
![Image1](docs/media/img3.jpg)
![Image4](docs/media/img4.jpg)
![Image5](docs/media/img5.jpg)

## Below is a list of features for the Full Stack CRUD App:

- Supports CRUD operations, including creating, reading, updating, and deleting entries.
- Follows the Model-View-Controller Model.
- Includes multiple routes, admin routes, user authentication using JWT, and cookie storage.
- Includes a payment page powered by Stripe.
- Uses Parcel to bundle front-end files into one .map file for easier and more effective deployment.
- Employs complex state management.
- Offers a beautiful front-end interface (not optimized for mobile responsiveness).
- Includes a fully fledged custom back-end API with sorting, finding, and pagination capabilities.

## The API can be accessed on the url/api/v1/...

## Below is a list of technologies used to build the application:

- NodeJS - used as the runtime environment.
- MongoDB Atlas - utilized as the NO-SQL database.
- Express - employed as the primary backend framework.
- JSON Web Tokens - utilized for user authentication.
- Mongoose - used to interact with MongoDB and create the models.
- Node-Mailer - used to send emails.
- Pug Templating - used for rendering templates.
- Stripe - used for payments.
- Mapbox - utilized for maps.
- ParcelJS - used for bundling packages.
- MailTrap and SMTP - employed for emails.
- Postman - used for API testing.
- Heroku - utilized for deployment.

### To just view the application
1. Clone the repository
2. cd into the directory
3. run ```npm i```
4. run ```npm start```

### To edit the application
1. Clone the repository
2. cd into the directory
3. run ```npm i```
4. run ```npm run watch:js``` to start the parcel bundling service
5. run ```npm run dev```

### I plan to implement the following improvements in the future:

- Use Docker to enable error-free operation on any machine for a seamless experience.
- Implement athentication features: confirm user email, keep users logged in with refresh tokens, two-factor auth
- Implement reviews functionality
- Implement Manage Page for tour administrating