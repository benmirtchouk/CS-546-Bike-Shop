# Bike Shop

CS-546 Summer 2021 group project

## Installation 

- Have NodeJS version `v10.19.0` installed and Mongo server version`4.4.7`
  - Code should work on different version, however logic was tested on the above 
- Run `npm install` to get all the node modules
- Ensure the mongo server is running on the local device. Target connection and db name can be changed in [config/mongoConnection.js](https://github.com/benmirtchouk/CS-546-Bike-Shop/blob/main/config/mongoConnection.js#L3-L6)
- `npm run seed` to populate the database with initial values
- `npm start` to spin up the server
- Server can be accessed on `localhost:3000` by default

## Usage

The landing page will show up to 20 products for sale, and will link to the individual product pages. If the user signs in and they are not an admin, they will be able to see their orders. If the signed in user is an admin they will have a link in the header to the Admin Portal in which they can manage stock and analytic data. 

## Made by
[Repo Contributors](https://github.com/benmirtchouk/CS-546-Bike-Shop/graphs/contributors) 

