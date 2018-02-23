const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

function get_nbpages(url, callback) {
    request(url, function (err, resp, body) {
        if (!err) {
            const $ = cheerio.load(body);
            var pages = $('ul.pager').children('.last').prev().children().html();
            callback(pages);
            //console.log(pages);      
        } 
    });    
}

function get_urls(url, callback) {
    var page_urls = [];
    request(url, function (err, resp, html) {
        if (!err) {
            const $ = cheerio.load(html);
            $('a[class=poi-card-link]').each(function (i, elem) {
                page_urls.push('https://restaurant.michelin.fr' + $(elem).attr('href'));
            });
            callback(page_urls);
        }
    });
}

function get_info(url, callback) {
    request(url, function (err, resp, html) {
        if(!err) {
            const $ = cheerio.load(html);
            var name = $('h1').first().text();
            var road = $('.thoroughfare').first().text();
            var zipcode = $('.postal-code').first().text();;
            var city = $('.locality').first().text();
            var chef = $('.field--name-field-chef').children('.field__items').text();
            var restaurant = {
                "name": name,
                "road": road,
                "zipcode": zipcode,
                "city": city,
                "address": road + ' ' + zipcode + ' ' + city,
                "chef": chef,
                "url": url
            };
            callback(restaurant);
        }
    })
}

function scrape(url)
{
    
}

function get() {
    get_info();
}

exports.get = get;

//"https://restaurant.michelin.fr/restaurants/france/restaurants-1-etoile-michelin/restaurants-2-etoiles-michelin/restaurants-3-etoiles-michelin"