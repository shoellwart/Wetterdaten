const crypto = require('crypto');
const mongodb = require('mongodb'); // eslint-disable-line import/no-extraneous-dependencies
const { MongoClient } = require('mongodb'); // eslint-disable-line import/no-extraneous-dependencies

const mongourl = 'mongodb://127.0.0.1:27017';

async function register(res, username, password) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const users = db.collection('users');
    if (await users.findOne({ username })) {
      res.clearCookie('userid');
      res.status(400).send('User already exists');
      return; // finally will still execute
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const newUser = await users.insertOne({ username, hash, salt });
    res.cookie('userid', newUser.insertedId.toString(), { sameSite: 'lax' });
    res.redirect('/');
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function login(res, username, password) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const users = db.collection('users');
    const user = await users.findOne({ username });
    if (!user) {
      res.clearCookie('userid');
      res.status(400).send('Username or password is incorrect');
      return; // finally will still execute
    }
    const { salt } = user;
    const { hash } = user;
    const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    if (newHash === hash) {
      
      // mongodb id should not be used as session cookie
      res.cookie('userid', user._id.toString(), { sameSite: 'lax' }); // eslint-disable-line no-underscore-dangle
      res.redirect('/');
    } else {
      res.clearCookie('userid');
      res.status(400).send('Username or password is incorrect');
    }
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function checkCookie(id) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const users = db.collection('users');
    const user = await users.findOne({ _id: new mongodb.ObjectId(id) });
    if (user) {
      return true;
    }
    return false;
  } catch (err) {
    console.log(`an error occured: ${err}`);
    return false;
  } finally {
    await client.close();
  }
}

async function getStations(res, state, id, name) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const stations = db.collection('stations');
    if (id) {
      const found = await stations.find({ id }).toArray();
      if ((!name || found[0].name === name) && (!state || found[0].state === state)
      && found.length > 0) {
        res.json(found);
      } else {
        res.json([]);
      }
    } else if (name) {
      const found = await stations.find({ name }).toArray();
      if ((!id || found[0].id === id) && (!state || found[0].state === state)
        && found.length > 0) {
        res.json(found);
      } else {
        res.json([]);
      }
    } else if (state) {
      res.json(await stations.find({ state }).toArray());
    } else {
      res.json(await stations.find({}).toArray());
    }
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function addStation(res, state, id, name) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const stations = db.collection('stations');
    if (!id || !state || !name) {
      res.status(400).json('id, state and name are required');
      return;
    }
    if (await stations.findOne({ id })) {
      res.status(400).json('Station already exists');
      return;
    }
    await stations.insertOne({ state, id, name });
    res.json(`Station with id: ${id} added successfully`);
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function updateStation(res, state, id, name) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const stations = db.collection('stations');
    if (!id) {
      res.status(400).json('Station id is required');
      return;
    }
    if (!state && !name) {
      res.status(400).json('Station state or name are required');
      return;
    }
    let newStation;
    if (!name) {
      newStation = await stations.updateOne(
        { id },
        {
          $set: { state },
          $currentDate: { lastModified: true },
        },
      );
    } else if (!state) {
      newStation = await stations.updateOne(
        { id },
        {
          $set: { name },
          $currentDate: { lastModified: true },
        },
      );
    } else {
      newStation = await stations.updateOne(
        { id },
        {
          $set: { state, name },
          $currentDate: { lastModified: true },
        },
      );
    }
    if (newStation.matchedCount === 0) {
      res.status(400).json('Station does not exist');
    } else {
      res.json(`Updated Station with id: ${id}`);
    }
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function deleteStation(res, id) {
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const stations = db.collection('stations');
    const deletedStation = await stations.findOneAndDelete({ id });
    if (deletedStation.value === null) {
      res.status(400).json('Station does not exist');
      return;
    }
    res.json(`Station with id: ${id} deleted successfully`);
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
    res.json();
  } finally {
    await client.close();
  }
}

async function initStations() {
  const states = ['Burgenland', 'Kärnten', 'Niederösterreich', 'Oberösterreich', 'Salzburg', 'Steiermark', 'Tirol', 'Vorarlberg', 'Wien'];
  const client = new MongoClient(mongourl);
  try {
    const db = client.db('project');
    const stations = db.collection('stations');
    const data = await stations.find({}).toArray();
    if (data.length !== 0) { return; }
    for (const state of states) { // eslint-disable-line no-restricted-syntax
      const url = 'https://dataset.api.hub.zamg.ac.at/v1/station/%7Bmode%7D/klima-v1-10min/filter?state={state}&start_date=2021-01-01&end_date=2021-01-01';
      const res = await fetch(url.replace('{state}', state)); // eslint-disable-line no-await-in-loop
      const json = await res.json(); // eslint-disable-line no-await-in-loop
      await stations.insertMany(json.matching_stations); // eslint-disable-line no-await-in-loop
    }
  } catch (err) {
    console.log(`an error occured: ${err}`); // eslint-disable-line no-console
  } finally {
    await client.close();
  }
}

module.exports = {
  register,
  login,
  checkCookie,
  getStations,
  addStation,
  updateStation,
  deleteStation,
  initStations,
};
