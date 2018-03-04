const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');



const restaurantsPage = 'https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin';
const restaurantPage = 'https://restaurant.michelin.fr';

function get_UrlsOnPage(pageNumber) {
    let url = restaurantsPage + `/page-${pageNumber}`;
    let restaurantsOnPage = [];
    return new Promise((resolve, reject) => {
        request(url, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            const $ = cheerio.load(body);
            $('a.poi-card-link').each((i, elem) => {
                restaurantsOnPage.push($(elem).attr('href'));             
            });
            return resolve(restaurantsOnPage);
            //console.log(restaurantsOnPage);
        });
    });
}

function get_InfoRestaurant(urlRestaurant) {
    let url = restaurantPage + urlRestaurant;
    let restaurant = {
        "urlMichelin" : url,
        "address" : {}
    }
    return new Promise((resolve, reject) => {
        request(restaurant.urlMichelin, (err, resp, body) => {
            if (err) {
                return reject(err);
            }
            const $ = cheerio.load(body);
            restaurant.name = $('h1').first().text();
            restaurant.address.thoroughfare = $('.thoroughfare').first().text();
            restaurant.address.postalcode = $('.postal-code').first().text();
            restaurant.address.locality = $('.locality').first().text();
            restaurant.chef = $('.field--name-field-chef > .field__items').text();
            restaurant.stars = 1;
            if ($('span').hasClass('icon-cotation2etoiles')) {
                restaurant.stars = 2;
            }
            if ($('span').hasClass('icon-cotation3etoiles')) {
                restaurant.stars = 3;
            }
            //console.log(restaurant);
            return resolve(restaurant);
        });
    });
}

function getAllRequests(restaurantsPages) {
    requests = [];
    return new Promise((resolve, reject) => {
        restaurantsPages.forEach((restaurantsPage) => {
            restaurantsPage.forEach((restaurantPage) => {
                requests.push(get_InfoRestaurant(restaurantPage));
            });
        });
        return resolve(Promise.all(requests));
    });
}

function writeResult(jsonResult) {
    return new Promise((resolve, reject) => {
        fs.writeFile('./output/restaurants.json', JSON.stringify(jsonResult), 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            return resolve();
        });
    });
}

function totalPageNbrToArr() {
    let restaurantsPagesNbr = [];
    return new Promise((resolve, reject) => {
        for (let i = 1; i < 36; i++) {
            restaurantsPagesNbr.push(i);
        }
        if (restaurantsPagesNbr !== []) {
            return resolve(restaurantsPagesNbr);
        }
        else {
            return reject();
        }
    });
}

function fetchAllUrls(pageArr) {
    let reqArr = [];
    return new Promise((resolve, reject) => {
        reqArr = pageArr.map((page) => get_UrlsOnPage(page));
        return resolve(Promise.all(reqArr));
    });
}

function scrape() {
    let restaurantsPagesNbr = [];
    let restaurantsPagesReq;
    let restaurantsPages;
    let restaurantsInfoReq;
    totalPageNbrToArr()
        .then((result) => fetchAllUrls(result))
        .then((result) => getAllRequests(result))
        .then((result) => {
            console.log("Writing on restaurants.json...");
            writeResult(result);
        })
        .then(() => console.log('Done !'))
        .catch((err) => (console.log(err)));
}

function get() {
    if (!fs.existsSync('./output/restaurants.json')) {
        console.log('Scrapping...');
        scrape();
        return 0;
    }
    let content = fs.readFileSync('./output/restaurants.json', 'utf-8');
    return JSON.parse(content);
}

 
//exports.get_UrlsOnPage = get_UrlsOnPage;
//exports.get_InfoRestaurant = get_InfoRestaurant;
//exports.writeResult = writeResult;
exports.get = get;