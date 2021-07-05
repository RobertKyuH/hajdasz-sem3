//p455w0rd

import test from 'ava'
import Accounts from '../modules/accounts.js'
import Topics from '../modules/topics.js'
import PostsUnderTopics from '../modules/postsUnderTopics.js'


// register and login to 3 different accounts
test('OWN REGISTER+LOGIN TEST : register and log in 3 accounts with a valid account', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
	try {
		await account.register('user1', 'p455w0rd', 'robert@interwork.pl')
        await account.register('user2', 'p455w0rd', 'robert1@interwork.pl')
        await account.register('user3', 'p455w0rd', 'robert2@interwork.pl')

        const loginOne = await account.login('user1', 'p455w0rd')
        const loginTwo = await account.login('user2', 'p455w0rd')
        const loginThree = await account.login('user3', 'p455w0rd')

		test.is(loginOne && loginTwo && loginThree, true, 'unable to log in')
	} catch(err) {
		test.fail('error thrown:' + err)
	} finally {
		account.close()
	}
})

// create account, login, add topic, add post
test('OWN CREATE TOPIC+POST TEST : register, login, add topic and add post', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
    const topics = await new Topics()
    const postsUnderTopics = await new PostsUnderTopics()
	try {
		await account.register('user1', 'p455w0rd', 'robert@interwork.pl')

        const login = await account.login('user1', 'p455w0rd')

        let avatar = {path: "public/avatars/bike.png"};
        const topic_add_status =await topics.addTopic("TestTopicName", "TestSummary", "TestDescription", avatar, "user1")
        const add_post = await postsUnderTopics.addPost("user1", "test message", 1)

        test.is(add_post, true, 'unable to create topic+post')
	} catch(err) {
		test.fail('error thrown:' + err)
	} finally {
		account.close()
	}
})

// add forum without avtar
test('OWN CREATE TOPICwithout avatar', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
    const topics = await new Topics()
    const postsUnderTopics = await new PostsUnderTopics()
	try {
		await account.register('user1', 'p455w0rd', 'robert@interwork.pl')

        const login = await account.login('user1', 'p455w0rd')

        let avatar = {path: ""};
        const topic_add_status =await topics.addTopic("TestTopicName", "TestSummary", "TestDescription", avatar, "user1")

        test.fail("Topic added without avatar")
	} catch(err) {
		test.is(true, true, 'Other unknown error')
	} finally {
		account.close()
	}
})

// add forum without any data
test('OWN CREATE TOPIC without any data', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
    const topics = await new Topics()
    const postsUnderTopics = await new PostsUnderTopics()
	try {
		await account.register('user1', 'p455w0rd', 'robert@interwork.pl')

        const login = await account.login('user1', 'p455w0rd')

        let avatar = {path: ""};
        const topic_add_status =await topics.addTopic("", "", "", avatar, "")

        test.fail("Topic added without avatar")
	} catch(err) {
		test.is(true, true, 'Other unknown error')
	} finally {
		account.close()
	}
})