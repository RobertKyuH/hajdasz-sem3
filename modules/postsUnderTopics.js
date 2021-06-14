
/** @module PostsUnderTopics */

import sqlite from 'sqlite-async'
import fs from 'fs-extra'


/**
 * Topics
 * ES6 module that handles topics
 */
class PostsUnderTopics {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS PostsUnderTopics\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, creation_date_time DATETIME, topicId INT, CONSTRAINT fk_topic FOREIGN KEY (topicId) REFERENCES topics(id));'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * add new topic
	 * @param {String} username the user that posted
	 * @param {String} message the user message
	 * @param {String} description the chosen description
     * 
	 * @returns {Boolean} returns true if the topic has been added
	 */
	// dodanie tematu do bazy danych
	async addPost(username, message, topicid) {

		// data dodania postu
		let current_date = Date.now()
		let date_obj = new Date(current_date)

		let year = date_obj.getFullYear()


		let month = (parseInt(date_obj.getMonth()+1) < 10) ? "0" : ""
		month+=date_obj.getMonth()+1
		let day = (parseInt(date_obj.getDate() < 10)) ? "0" : ""
		day+=date_obj.getDate()

		let date_string = year+"-"+month+"-"+day

		var hour = date_obj.getHours();
    	hour = (hour < 10 ? "0" : "") + hour;

    	var min  = date_obj.getMinutes();
    	min = (min < 10 ? "0" : "") + min;

		let creation_time = hour +":"+min+":"+"00";

		// format: '2007-01-01 10:00:00'

		let date_time = date_string + " " + creation_time;

		console.log(date_time)

		// zapisanie tematu w bazie danych
		let sql = `INSERT INTO PostsUnderTopics(username, message, creation_date_time, TopicID) VALUES ("${username}", "${message}", "${date_time}", ${topicid})`
		await this.db.run(sql)
		return true
	}
	// pobranie tematów z bazy danych
	async getAllPostsByTopicId(topicid){
		let sql = `SELECT * FROM PostsUnderTopics WHERE topicId=` + String(topicid)
		const records = await this.db.all(sql)

		return records
	}

	async getTheLatestPostDateByTopicId(topicid){
		let sql = `SELECT MIN(creation_date_time) as newestPost FROM PostsUnderTopics WHERE topicId='${topicid}'`

		const record = await this.db.all(sql)
		return record

	}

	async close() {
		await this.db.close()
	}
}

export default PostsUnderTopics