
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Topics from '../modules/topics.js'
import PostsUnderTopics from '../modules/postsUnderTopics.js'

const dbName = 'website.db'

// TODO put all authorised routers to secure.js !@!!!!!

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		console.log("AUTHL: " + ctx.session.authorised)
		const topics = await new Topics(dbName)

		ctx.hbs.topics = await topics.getAllTopics()

		// daty ostatnich postow
		const posts = await new PostsUnderTopics(dbName)
		const dates = []

		for(var i=0;i<ctx.hbs.topics.length;i=i+1){
			let latestsDate = await posts.getTheLatestPostDateByTopicId(ctx.hbs.topics[i].id)
			if(latestsDate[0]['newestPost'] != null)
				ctx.hbs.topics[i].lastPostDate = latestsDate[0]['newestPost'].substring(0, 10)
			else
				ctx.hbs.topics[i].lastPostDate = ctx.hbs.topics[i].creation_date + " created"
		}

		await ctx.render('index', ctx.hbs)
	} catch(err) {
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	}
})


/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */
router.get('/register', async ctx => await ctx.render('register'))

router.get('/secure', async ctx => 
{
	try{
		const topics = await new Topics(dbName)

		ctx.hbs.topics = await topics.getAllTopics()
	
		await ctx.render('secure', ctx)
	}
	catch(err){
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */
router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		// call the functions in the module
		await account.register(ctx.request.body.user, ctx.request.body.pass, ctx.request.body.email)
		ctx.redirect(`/login?msg=new user "${ctx.request.body.user}" added, you need to log in`)
	} catch(err) {
		console.log(err)
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs.msg)
	} finally {
		await account.close()
	}
})

router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login')
})


router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		await account.login(body.user, body.pass)
		ctx.session.authorised = true
		ctx.session.username = body.user
		const referrer = body.referrer || '/'
		await ctx.redirect('/')
		//await ctx.render('secure', ctx.session)
	} catch(err) {
		console.log(err)
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		await account.close()
	}
})

router.get('/logout', async ctx => {
	ctx.session.authorised = null
	ctx.session.username = null
	ctx.redirect('/?msg=you are now logged out')
})

// topics routes

// get page
router.get('/addtopic', async ctx => {
	try {
		console.log("ADD TOPIC RED")
		await ctx.render('addtopic', ctx.hbs)
	} catch(err) {
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	}
})

// post form handle
router.post('/addTopic', async ctx=>{
	const topic = await new Topics(dbName)
	ctx.hbs.body = ctx.request.body

	try{
		const body = ctx.request.body
		console.log("TEST: " + ctx.request.files)
		await topic.addTopic(body.topicName, body.topicSummary, body.topicDescription, ctx.request.files.topicAvatar, ctx.session.username)
		const referrer = body.referrer || '/'
		return ctx.redirect(`/addtopic/?msg=Forum added properly`)
	} catch(err){
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	} finally{
		// TODO
	}

})

// get forum
router.post('/showtopic', async ctx=>{

	const topic = await new Topics(dbName)
	try{
		console.log("Body: " + ctx.request.body.topicID)

		await ctx.redirect('/showtopic/?topicID=' + ctx.request.body.topicID)
		
	}catch(err){
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	} finally{
		// TODO
	}

})

router.get('/showtopic', async ctx=>{
	try {
		// topic
		const topic = await new Topics(dbName)
		const currentTopic = await topic.getTopicById(ctx.request.query.topicID)
		console.log("PATH: " + currentTopic.miniature_path)
		// posts
		const posts = await new PostsUnderTopics(dbName)
		const forumsPosts = await posts.getAllPostsByTopicId(ctx.request.query.topicID)

		for(var i=0;i<forumsPosts.length;i=i+1){
			forumsPosts[i].creation_date_time = forumsPosts[i].creation_date_time.substring(0, 10)
		}


		ctx.hbs.topic = currentTopic
		ctx.hbs.posts = forumsPosts

		await ctx.render('showtopic', ctx.hbs)
	} catch(err) {
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	}
})

//

// add post handle

router.post('/addpost', async ctx=>{
	try{
		const postsUnderTopics = await new PostsUnderTopics(dbName)
		const body = ctx.request.body
		
		await postsUnderTopics.addPost(ctx.session.username, body.message, body.topicID)

		const referrer = body.referrer || '/'

		return await ctx.redirect(`${referrer}`)


	}catch(err){
		ctx.hbs.message = err.message
		await ctx.render('error', ctx.hbs)
	}
})


export default router
