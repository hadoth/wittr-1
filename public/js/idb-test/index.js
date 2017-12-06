import idb from 'idb';

var dbPromise = idb.open('test-db', 4, function (upgradeDb) {
    switch (upgradeDb.oldVersion) {
        case 0:
            var keyValStore = upgradeDb.createObjectStore('keyval');
            keyValStore.put("world", "hello");
        case 1:
            upgradeDb.createObjectStore('people', {keyPath: "name"});
        case 2:
            let peopleStore = upgradeDb.transaction.objectStore("people");
            peopleStore.createIndex("animal", "favouriteAnimal");
        case 3:
            let peopleStoreAge = upgradeDb.transaction.objectStore("people");
            peopleStoreAge.createIndex("age", "age");
            console.log("create new db");
    }
});

// read "hello" in "keyval"
dbPromise.then(function (db) {
    var tx = db.transaction('keyval');
    var keyValStore = tx.objectStore('keyval');
    return keyValStore.get('hello');
}).then(function (val) {
    console.log('The value of "hello" is:', val);
});

// set "foo" to be "bar" in "keyval"
dbPromise.then(function (db) {
    var tx = db.transaction('keyval', 'readwrite');
    var keyValStore = tx.objectStore('keyval');
    keyValStore.put('bar', 'foo');
    return tx.complete;
}).then(function () {
    console.log('Added foo:bar to keyval');
});

dbPromise.then(function (db) {
    let tx = db.transaction('keyval', 'readwrite');
    let keyValStore = tx.objectStore('keyval');
    keyValStore.put('filthy animal', 'favoriteAnimal');
    return tx.complete;
});

dbPromise.then(function (db) {
    let tx = db.transaction('people', 'readwrite');
    let personStore = tx.objectStore('people');
    personStore.put({
        name: "Harry Potter",
        age: 11,
        favouriteAnimal: "owl"
    });

    personStore.put({
        name: "Bruce Wayne",
        age: 35,
        favouriteAnimal: "bat"
    });

    personStore.put({
        name: "Peter Parker",
        age: 16,
        favouriteAnimal: "spider"
    });
    return tx.complete;
});

let readUser = function (user) {
    console.log("%s is %i  years old and has %s as favourite animal", user.name, user.age, user.favouriteAnimal);
};

let readUsers = function (users) {
    users.map(function (user) {
        readUser(user)
    })
};

dbPromise.then(function (db) {
    let tx = db.transaction('people');
    let personStore = tx.objectStore('people');
    let animalIndex = personStore.index("age");
    return animalIndex.getAll();
}).then(function (people) {
    readUsers(people);
});