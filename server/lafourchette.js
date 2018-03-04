const request = require('request');
const fs = require('fs');
const similarity = require('similarity');
const michelin = require('./michelin');


const urlApiSearch= 'https://m.lafourchette.com/api/restaurant/search?&offer=0&origin_code_list[]=THEFORKMANAGER&limit=400';


function getDealsById(restaurant) {
    restaurant.sales = [];
    return new Promise((resolve, reject) => {
        if (restaurant.isOnLaF) {
            request('https://m.lafourchette.com/api/restaurant/' + `${restaurant.id}/sale-type`, (err, resp, body) => {
                if (err) {
                    return reject(err);
                }
                restaurant.sales = JSON.parse(body).filter((deal) => {
                    return deal.is_special_offer === true;
                });
                return resolve(restaurant);
            });
        }
        else {
            return resolve(restaurant);
        }
    });
}

function searchRestaurant(restaurant) {
    restaurant.isOnLaF = false;
    const matchPrecision = 0.7;
    const options = {

        'uri': urlApiSearch + `&search_text=${encodeURIComponent(restaurant.name)}`,
        'json': true
    };
    return new Promise((resolve, reject) => {
        request(options, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            for (let i = 0; i < body.items.length; i++) {
                resultRestaurant = body.items[i];
                if (restaurant.address.postalcode === resultRestaurant.address.postalcode) {
                    if (similarity(restaurant.address.thoroughfare, resultRestaurant.address.thoroughfare) > matchPrecision) {
                        restaurant.laFName = resultRestaurant.name;
                        restaurant.id = resultRestaurant.id;
                        restaurant.laFUrl = `https://www.lafourchette.com/restaurant/${encodeURIComponent(restaurant.laFName)}/${restaurant.id}`;
                        restaurant.geo = resultRestaurant.geo;
                        restaurant.phone = resultRestaurant.phone;
                        restaurant.isOnLaF = true;
                        break;
                    }
                }
            }
            return resolve(restaurant);
        });
    });
}

function writeResult(jsonResult) {
    return new Promise((resolve, reject) => {
        fs.writeFile('output/restaurants2.json', JSON.stringify(jsonResult), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function fetchAllRestaurant() {
    restaurants = michelin.get();
    if (restaurants) {
        requests = restaurants.map((restaurant) => searchRestaurant(restaurant));
        Promise.all(requests)
            .then(((result) => {
                console.log("Writing...")
                writeResult(result);
            }))
            .then(() => console.log("Restaurants updated!"))
            .catch((err) => console.log(err));
    }
    else {
        console.log('Please wait...');
    }
}

function getAllRestaurants() {
    if (!fs.existsSync('./output/restaurants2.json')) {
        console.log('Scrapping...');
        fetchAllRestaurant();
        return 0;
    }
    else {
        let content = fs.readFileSync('./output/restaurants2.json', 'utf-8');
        return JSON.parse(content);
    }
}


exports.getAllRestaurants = getAllRestaurants;