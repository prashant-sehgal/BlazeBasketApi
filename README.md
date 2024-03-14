# Blaze Basket API

A restfull backend server api for cross-platform blazebasket website and app.

## Features

-   Stateless API with JsonWebToken Authentication
-   Work with any kind of front-ent application like website, apps(android and ios) or even desktop application,
-   Used mongodb database, with secure stripe payments and sendrid email service.
-   Secure api with Authentication and Authorization of data access.

### 1. Clonning and Installation Steps

1. Clonning Repository

```sh
git clone https://github.com/prashant-sehgal/BlazeBasketApi.git
```

### 2. Create config.env File

config.env is one of the most important and secured file of the whole project. It consist environment variables defining database adress, api keys and other confidential details.
This file consist

| Variable          | Data Defination                                      |
| ----------------- | ---------------------------------------------------- |
| NODE_ENV          | define running environment development or production |
| PORT              | define port number of application                    |
| mongodb           | defines mongodb database string                      |
| EMAIL_SENDER      | define service email address                         |
| EMAIL_HOST        | define email host server                             |
| EMAIL_PORT        | define email host port number                        |
| EMAIL_USER        | define email username                                |
| EMAIL_PASSWORD    | define email password                                |
| JWT_SECRET_KEY    | define json webt token secret key                    |
| JWT_EXPIRES_IN    | define the time aster which jwt expires              |
| STRIPE_SECRET_KEY | define stripes paymeny sercret key                   |
| ENC_KEY           | define encryption key                                |

### 3. Run Project

(in the main project folder run these command)

```sh
npm install
npm run build
npm run start
```

## API Documentation

[Blaze Baslet API Documention](https://documenter.getpostman.com/view/13135527/2s9YkgDkFJ)

## License

**Free & OpenSource Software**
