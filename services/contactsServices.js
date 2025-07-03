import Contact from '../db/models/contact.js';

export const listContacts = async () => {
    const contacts = await Contact.findAll();
    return contacts;
}

export const getContactById = async (contactId) => {
    const contact = await Contact.findByPk(contactId);
    return contact;
}

export const removeContact = async (contactId) => {
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
        return null;
    }

    await contact.destroy();
    return contact;
}

export const addContact = async (name, email, phone) => {
    const newContact = await Contact.create({
        name,
        email,
        phone
    });

    return newContact;
}

export const updateContact = async (contactId, data) => {
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
        return null;
    }

    await contact.update(data);
    return contact;
}

export const updateStatusContact = async (contactId, { favorite }) => {
    const contact = await Contact.findByPk(contactId);
    if (!contact) {
        return null;
    }

    await contact.update({ favorite });
    return contact;
}
