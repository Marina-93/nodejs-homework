const express = require('express');
const createError = require('http-errors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { Contact, schema } = require('../../models/contact');
const { authenticate } = require('../../middlewares');

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const result = await Contact.find({ owner: _id }, '', {
      skip,
      limit: +limit,
    }).populate('owner', 'email');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    const decodeToken = jwt.decode(token);
    const result = await Contact.findById(contactId).populate('owner', 'email');
    if (decodeToken.id === String(result.owner._id)) {
      res.json(result);
    } else if (!decodeToken.id === String(result.owner._id) || !result) {
      throw new createError(404, 'Not found');
    }
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { error } = schema.add.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing required name field');
    }
    const data = { ...req.body, owner: req.user._id };
    const result = await Contact.create(data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:contactId', authenticate, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    const decodeToken = jwt.decode(token);
    if (decodeToken.id === String(result.owner._id)) {
      await Contact.findByIdAndDelete(contactId);
      res.json({ message: 'Contact deleted' });
    } else if (!decodeToken.id === String(result.owner._id) || !result) {
      throw new createError(404, 'Not found');
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = schema.add.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing fields');
    }
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    const decodeToken = jwt.decode(token);
    if (decodeToken.id === String(result.owner._id)) {
      const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
      });
      res.json(result);
    } else if (!decodeToken.id === String(result.owner._id) || !result) {
      throw new createError(404, 'Not found');
    }
  } catch (error) {
    next(error);
  }
});

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { error } = schema.favorite.validate(req.body);
    if (error) {
      throw new createError(400, 'Missing field favorite');
    }
    const { contactId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      throw new createError(404, 'Id not valid');
    }
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');
    const decodeToken = jwt.decode(token);
    if (decodeToken.id === String(result.owner._id)) {
      const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!result) {
      throw new createError(404, 'Not found');
    }
    res.json(result);
    } else if (!decodeToken.id === String(result.owner._id)) {
      throw new createError(404, 'Not found');
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
