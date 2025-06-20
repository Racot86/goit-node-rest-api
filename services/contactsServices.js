import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contactsPath = path.join(__dirname, '..', 'db', 'contacts.json');



export const listContacts = async () => {
    const data = await fs.readFile(contactsPath, 'utf-8');
    if(data) {
        return JSON.parse(data);
    }else {
        return null;
    }
}

export const getContactById = async (contactId) => {
    return listContacts().then(data => data.find(entry => entry.id === contactId) ?? null);
}

export const removeContact = async (contactId) => {
    const contactExists = await getContactById(contactId);
    if (!contactExists) {
        return null;
    }

    const contacts = await listContacts();
    const newContacts = contacts.filter(contact => contact.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(newContacts));

    return contactExists;
}

export const addContact = async (name, email, phone) => {
    const newContact = {
        "id": randomUUID(),
        "name": name,
        "email": email,
        "phone": phone
    }

    const contacts = await listContacts();
    contacts.push(newContact);
    await fs.writeFile(contactsPath, JSON.stringify(contacts));
    return newContact;
}

export const updateContact = async (contactId, data) => {
    const contactExists = await getContactById(contactId);
    if (!contactExists) {
        return null;
    }

    const contacts = await listContacts();
    const index = contacts.findIndex(contact => contact.id === contactId);

    const updatedContact = {
        ...contactExists,
        ...data
    };

    contacts[index] = updatedContact;
    await fs.writeFile(contactsPath, JSON.stringify(contacts));

    return updatedContact;
}
