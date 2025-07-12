import express from "express";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateFavoriteStatus,
} from "../controllers/contactsControllers.js";
import validateBody from "../helpers/validateBody.js";
import authenticate from "../middlewares/authenticate.js";
import { createContactSchema, updateContactSchema, updateFavoriteSchema } from "../schemas/contactsSchemas.js";

const contactsRouter = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Contact:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the contact
 *         name:
 *           type: string
 *           description: The name of the contact
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the contact
 *         phone:
 *           type: string
 *           description: The phone number of the contact
 *         favorite:
 *           type: boolean
 *           description: Whether the contact is marked as favorite
 *           default: false
 *       example:
 *         id: "1"
 *         name: "John Doe"
 *         email: "john@example.com"
 *         phone: "+1234567890"
 *         favorite: false
 */

// Apply authenticate middleware to all routes
contactsRouter.use(authenticate);

/**
 * @swagger
 * /api/contacts:
 *   get:
 *     summary: Returns the list of all contacts
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The list of contacts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contact'
 *       401:
 *         description: Unauthorized
 */
contactsRouter.get("/", getAllContacts);

/**
 * @swagger
 * /api/contacts/{id}:
 *   get:
 *     summary: Get a contact by id
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     responses:
 *       200:
 *         description: The contact description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       404:
 *         description: The contact was not found
 *       401:
 *         description: Unauthorized
 */
contactsRouter.get("/:id", getOneContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   delete:
 *     summary: Remove the contact by id
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     responses:
 *       200:
 *         description: The contact was deleted
 *       404:
 *         description: The contact was not found
 *       401:
 *         description: Unauthorized
 */
contactsRouter.delete("/:id", deleteContact);

/**
 * @swagger
 * /api/contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               favorite:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: The contact was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 */
contactsRouter.post("/", validateBody(createContactSchema), createContact);

/**
 * @swagger
 * /api/contacts/{id}:
 *   put:
 *     summary: Update a contact by id
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: The contact was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: The contact was not found
 *       401:
 *         description: Unauthorized
 */
contactsRouter.put("/:id", validateBody(updateContactSchema), updateContact);

/**
 * @swagger
 * /api/contacts/{contactId}/favorite:
 *   patch:
 *     summary: Update a contact's favorite status
 *     tags: [Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favorite
 *             properties:
 *               favorite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The contact's favorite status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contact'
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: The contact was not found
 *       401:
 *         description: Unauthorized
 */
contactsRouter.patch("/:contactId/favorite", validateBody(updateFavoriteSchema), updateFavoriteStatus);

export default contactsRouter;
