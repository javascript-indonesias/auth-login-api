// Both numbers and letters
function generateMixedID() {
    return new Promise((resolve) => {
        const now = new Date();

        let timestamp = now.getFullYear().toString();
        timestamp += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString();
        timestamp += (now.getDate < 10 ? '0' : '') + now.getDate().toString();
        timestamp += now.getHours().toString();
        timestamp += now.getMinutes().toString();
        timestamp += now.getSeconds().toString();
        timestamp += now.getMilliseconds().toString();

        let id = 'a';
        for (let i = 0; i < timestamp.length; i += 1) {
            id =
                id +
                String.fromCharCode(97 + Number(timestamp[i])) +
                (Number(timestamp[i]) + 5);
        }

        resolve(id);
    });
}

// Letters
function generateBaseID() {
    return new Promise((resolve) => {
        const now = new Date();

        let timestamp = now.getFullYear().toString();
        timestamp += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString();
        timestamp += (now.getDate < 10 ? '0' : '') + now.getDate().toString();
        timestamp += now.getHours().toString();
        timestamp += now.getMinutes().toString();
        timestamp += now.getSeconds().toString();
        timestamp += now.getMilliseconds().toString();

        let id = '';
        for (let i = 0; i < timestamp.length; i += 1) {
            id += String.fromCharCode(97 + Number(timestamp[i]));
        }

        resolve(id);
    });
}

// Numbers
function generateNumID() {
    return new Promise((resolve) => {
        const now = new Date();

        let id = now.getFullYear().toString();
        id += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString();
        id += (now.getDate < 10 ? '0' : '') + now.getDate().toString();
        id += now.getHours().toString();
        id += now.getMinutes().toString();
        id += now.getSeconds().toString();
        id += now.getMilliseconds().toString();

        resolve(Number(id));
    });
}

export { generateMixedID, generateBaseID, generateNumID };
