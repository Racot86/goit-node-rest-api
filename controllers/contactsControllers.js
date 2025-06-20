import { listContacts, getContactById, removeContact, addContact, updateContact as updateContactService } from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
    try {
        const contacts = await listContacts();
        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

export const getOneContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await getContactById(id);

        if (!contact) {
            throw HttpError(404, "Not found");
        }

        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

export const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedContact = await removeContact(id);

        if (!deletedContact) {
            throw HttpError(404, "Not found");
        }

        res.status(200).json(deletedContact);
    } catch (error) {
        next(error);
    }
};

export const createContact = async (req, res, next) => {
    try {
        const { name, email, phone } = req.body;
        const newContact = await addContact(name, email, phone);

        res.status(201).json(newContact);
    } catch (error) {
        next(error);
    }
};

export const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (Object.keys(body).length === 0) {
            throw HttpError(400, "Body must have at least one field");
        }

        const updatedContact = await updateContactService(id, body);

        if (!updatedContact) {
            throw HttpError(404, "Not found");
        }

        res.status(200).json(updatedContact);
    } catch (error) {
        next(error);
    }
};
