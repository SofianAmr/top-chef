const michelin = require('./michelin');
const lafourchette = require('./lafourchette');

//michelin.get_UrlsOnPage();
//michelin.get_InfoRestaurant('/2af46v7/le-pre-catelan-paris-16');
//michelin.writeResult();
michelin.get();
lafourchette.getAllRestaurants();


console.log("test");