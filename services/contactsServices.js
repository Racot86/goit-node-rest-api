import Contact from '../db/models/contact.js';

export const listContacts = async (owner) => {
    const contacts = await Contact.findAll({
        where: { owner }
    });
    return contacts;
}

export const getContactById = async (contactId, owner) => {
    const contact = await Contact.findOne({
        where: { id: contactId, owner }
    });
    return contact;
}

export const removeContact = async (contactId, owner) => {
    const contact = await Contact.findOne({
        where: { id: contactId, owner }
    });
    if (!contact) {
        return null;
    }

    await contact.destroy();
    return contact;
}

export const addContact = async (name, email, phone, owner) => {
    const newContact = await Contact.create({
        name,
        email,
        phone,
        owner
    });

    return newContact;
}

export const updateContact = async (contactId, data, owner) => {
    const contact = await Contact.findOne({
        where: { id: contactId, owner }
    });
    if (!contact) {
        return null;
    }

    await contact.update(data);
    return contact;
}

export const updateStatusContact = async (contactId, { favorite }, owner) => {
    const contact = await Contact.findOne({
        where: { id: contactId, owner }
    });
    if (!contact) {
        return null;
    }

    await contact.update({ favorite });
    return contact;
}
