const path = require("path");

// using existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// function to assign ID's when needed
const nextId = require("../utils/nextId");

// middleware functions: Create, Read/List, Update dishes
// dishes cannot be deleted, no delete function

// creates a new dish, pushes new dish into existing dishes data and assigns a new ID
function create(req, res) {
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name: name,
        description: description,
        price:price,
        image_url: image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

// returns existing dish: single object - id, name, description, price
function read(req, res) {
    res.json({ data: res.locals.dish });
  }

// returns list of dishes: array of objects - id, name, description, price
function list(req, res) {
    res.json({ data: dishes });
}

// updates an existing dish
function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
}

/** VALIDATION **/

// validate body properties, in this case: name, description, price, image_url
function bodyDataHas(propertyName) {
    return function(req, res, next) {
        const { data = {} } = req.body;
        if(data[propertyName]) {
            return next();
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}`
        });
    };
}

// validate price property: 0 or less, must be an integer
function pricePropertyIsValid(req, res, next) {
    const { data: { price } = {} } = req.body;
    if(price < 0 || !Number.isInteger(price)) {
        return next({
            status: 400,
            message: `price`
        });
    }
    next();
}

// validate if dish exists
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if(foundDish) {
        res.locals.dish = foundDish;
        res.locals.dishId = dishId;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found ${dishId}`
    });
}

// validate if dish ID in body/object matches route ID
function validateDishBodyId(req, res, next) {
	const { dishId } = req.params;
	const { data: { id } = {} } = req.body;

	if(!id || id === dishId) {
		res.locals.dishId = dishId;
		return next();
	}

	next({
		status: 400,
		message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
	});
}

// exports and order for middleware functions
module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        pricePropertyIsValid,
        create
    ],
    read: [dishExists, read],
    update: [
        dishExists,
        bodyDataHas("name"),
        bodyDataHas("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        pricePropertyIsValid,
        validateDishBodyId,
        update
    ],
    list,
}