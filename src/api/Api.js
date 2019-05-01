import shortid from "shortid";
import PouchDB from "pouchdb";
import CryptoUtil from "@/utils/CryptoUtil";

shortid.characters(
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@"
);
const db = PouchDB("mknotes");
const security = PouchDB("security");

export default {
    async getNotes(decrypt = true) {
        const records = await db.allDocs({
            include_docs: true,
            attachments: true
        });
        const docs = [];
        records.rows.forEach(row => {
            if (decrypt) {
                row.doc.title = CryptoUtil.decryptString(row.doc.title);
                row.doc.value = CryptoUtil.decryptString(row.doc.value);
            }
            docs.push(row.doc);
        });
        return docs;
    },
    getNote(id) {},
    async putAttachment(id, name, mime, data) {
        const doc = await db.get(id);
        var blob = new Blob([data], {
            type: mime
        });
        const response = await db.putAttachment(id, name, doc._rev, blob, mime);
        return response;
    },
    async getAttachment(id, name) {
        const blob = await db.getAttachment(id, name);
        return blob;
    },
    async updateNote(payload) {
        const title = CryptoUtil.encryptString(payload.title);
        const value = CryptoUtil.encryptString(payload.value);
        const doc = await db.get(payload._id);
        doc.title = title;
        doc.value = value;
        await db.put(doc);
    },
    async addNote() {
        const newId = shortid.generate();
        const title = CryptoUtil.encryptString("");
        const value = CryptoUtil.encryptString("");
        const newNode = {
            _id: newId,
            title: title,
            value: value,
            created: Date.now()
        };

        const responseNode = await db.put(newNode);
        newNode._rev = responseNode._rev;
        newNode.title = "";
        newNode.value = "";
        return newNode;
    },
    async removeNote(id) {
        const doc = await db.get(id);
        await db.remove(doc);
    },
    async export() {
        const docs = await this.getNotes(false);
        const rawDocs = JSON.stringify(docs);
        var blob = new Blob([rawDocs], { type: "application/json" });
        return blob;
    },
    async initSecret(secret) {
        const hash = CryptoUtil.hashString(secret);
        await security.put({
            _id: "secret",
            secret: hash
        });
    },
    async updateSecret(secret) {
        var storedSecret = await security.get("secret");
        storedSecret.secret = CryptoUtil.hashString(secret);
        await security.put(storedSecret);
    },
    async getSecret() {
        return await security.get("secret");
    },
    async renewEncryption(oldSecret) {
        const notes = await this.getNotes(false);
        const scope = this;
        await notes.forEach(async note => {
            note.title = CryptoUtil.decryptString(note.title, oldSecret);
            note.value = CryptoUtil.decryptString(note.value, oldSecret);
            await scope.updateNote(note);
        });
    }
};