
/** @module Topics */

import sqlite from 'sqlite-async'
import fs from 'fs-extra'


/**
 * Topics
 * ES6 module that handles topics
 */
class Topics {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS topics\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, summary TEXT, description TEXT, miniature_path TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * add new topic
	 * @param {String} name the chosen topic name
	 * @param {String} summary the chosen summary
	 * @param {String} description the chosen description
     * 
	 * @returns {Boolean} returns true if the topic has been added
	 */
	async addTopic(name, summary, description, avatar) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM topics WHERE name="${name}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`topic "${name}" already in use`)

        // TODO here managing adding file
		await fs.copy(avatar.path, `public/avatars/${name}`)
		
        //
		sql = `INSERT INTO topics(name, summary, description, miniature_path) VALUES
		("${name}", "${summary}", "${description}", "public/avatars/${name}")`
		await this.db.run(sql)
        console.log("X2D")
		return true
	}

	async close() {
		await this.db.close()
	}
}

export default Topics
