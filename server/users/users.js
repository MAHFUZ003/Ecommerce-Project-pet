const express = require('express');
const xss = require('xss');
const { body, validationResult,param } = require('express-validator');
const pool = require('../../db/db');
const bcrypt = require('bcrypt');
// router for user
const usersRouter = express.Router();
// GET all users

usersRouter.get('/', async (req, res) => {
    const query = `
        SELECT id, email, created_at
        FROM users
        ORDER BY id
    `;

    try {
        const result = await pool.query(query);

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: true,
                message: "No users found!"
            });
        }

        res.status(200).json({
            error: false,
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: true,
            message: 'Internal Server Error'
        });
    }
});

// GET a user by ID
usersRouter.get('/:id',
    [
        param('id').isInt().withMessage('Invalid user id')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((err) => err.msg);
            return res.status(400).json({
                error: true,
                message: errorMessages[0]
            });
        }

        const { id } = req.params;

        const query = `
            SELECT id, email, created_at
            FROM users
            WHERE id = $1
        `;

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: true,
                    message: "User not found"
                });
            }

            res.status(200).json({
                error: false,
                data: result.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            });
        }
    }
);

//POST a new user
usersRouter.post('/',
  [
    body("password")
      .notEmpty().withMessage("Password is required")
      .isString().withMessage("Password must be a string")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

    body('email')
      .notEmpty().withMessage('Email is required')
      .isString().withMessage('Email must be a string')
      .trim().escape()
      .isLength({ max: 64 }).withMessage('Email must be at most 63 characters long')
      .customSanitizer(value => xss(value))
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [email, hashedPassword]);

      res.status(201).json({
        error: false,
        message: "User created successfully",
        data: result.rows[0]
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: 'Internal Server Error'
      });
    }
  }
);

// UPDATE user
usersRouter.put('/:id', 
  [
    param('id')
      .isInt().withMessage('Invalid user id'),

    body('email')
      .optional()
      .isString().withMessage('Email must be a string')
      .trim().escape()
      .isLength({ max: 64 }).withMessage('Email must be at most 64 characters long')
      .customSanitizer(value => xss(value)),

    body('password')
      .optional()
      .isString().withMessage('Password must be a string')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: true,
        message: errors.array()[0].msg
      });
    }

    const { id } = req.params;
    const { email, password } = req.body;

    // Build dynamic query
    const fields = [];
    const values = [];
    let idx = 1;

    if (email) {
      fields.push(`email = $${idx++}`);
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push(`password = $${idx++}`);
      values.push(hashedPassword);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'Nothing to update'
      });
    }

    values.push(id); // add id as last parameter

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, email, created_at
    `;

    try {
      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        return res.status(404).json({
          error: true,
          message: "User not found"
        });
      }

      res.status(200).json({
        error: false,
        message: "User updated successfully",
        data: result.rows[0]
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: 'Internal Server Error'
      });
    }
  }
);

// DELETE user
usersRouter.delete('/:id',
    [
        param('id')
            .isInt().withMessage('Invalid user id')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map((err) => err.msg);
            return res.status(400).json({
                error: true,
                message: errorMessages[0]
            });
        }

        const { id } = req.params;

        const query = `
            DELETE FROM users
            WHERE id = $1
            RETURNING *
        `;

        try {
            const result = await pool.query(query, [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: true,
                    message: "User not found"
                });
            }

            res.status(200).json({
                error: false,
                message: "User deleted successfully",
                data: result.rows[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: true,
                message: 'Internal Server Error'
            });
        }
    }
);

module.exports = usersRouter;
