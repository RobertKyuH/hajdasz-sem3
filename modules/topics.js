
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
				(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, summary TEXT, description TEXT, miniature_path TEXT, user_name TEXT, creation_date DATE, creation_time TIME);'
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
	// dodanie tematu do bazy danych
	async addTopic(name, summary, description, avatar, username) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM topics WHERE name="${name}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`topic "${name}" already in use`)


		// skopiowane pliku na serwer
		await fs.copy(avatar.path, `public/avatars/${avatar.name}`)

		// data dodania postu
		let current_date = Date.now()
		let date_obj = new Date(current_date)
		let date_string = date_obj.getFullYear() + "-" + (date_obj.getMonth()+1) + "-" + date_obj.getDate()

		var hour = date_obj.getHours();
    	hour = (hour < 10 ? "0" : "") + hour;

    	var min  = date_obj.getMinutes();
    	min = (min < 10 ? "0" : "") + min;

		let creation_time = hour +":"+min;

		// zapisanie tematu w bazie danych
		sql = `INSERT INTO topics(name, summary, description, miniature_path, user_name, creation_date, creation_time) VALUES
		("${name}", "${summary}", "${description}", "avatars/${avatar.name}", "${username}", "${date_string}", "${creation_time}")`
		await this.db.run(sql)
		return true
	}
	// pobranie tematów z bazy danych
	async getAllTopics(){
		let sql = `SELECT * FROM topics`
		const records = await this.db.all(sql)

		return records
	}

	// pobranie wybranego tematu
	async getTopicById(id){
		let sql = `SELECT * FROM topics WHERE id=` + String(id)
		const record = await this.db.get(sql)

		return record
	}

	async close() {
		await this.db.close()
	}
}

export default Topics
