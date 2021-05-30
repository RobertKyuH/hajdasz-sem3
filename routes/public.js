
import Router from 'koa-router'

const router = new Router()

import Accounts from '../modules/accounts.js'
import Topics from '../modules/topics.js'
const dbName = 'website.db'

/**
 * The secure home page.
 *
 * @name Home Page
 * @route {GET} /
 */
router.get('/', async ctx => {
	try {
		await ctx.render('index', ctx.hbs)
	} catch(err) {
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
		await ctx.render('register', ctx.hbs)
	} finally {
		await account.close()
	}
})

router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login', ctx.hbs)
})

router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		await account.login(body.user, body.pass)
		ctx.session.authorised = true
		const referrer = body.referrer || '/secure'
		return ctx.redirect(`${referrer}?msg=you are now logged in...`)
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
	ctx.redirect('/?msg=you are now logged out')
})

// topics routes

// get page
router.get('/addtopic', async ctx => {
	try {
		console.log("ADD TOPIC RED")
		await ctx.render('addtopic', ctx.hbs)
	} catch(err) {
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
		await topic.addTopic(body.topicName, body.topicSummary, body.topicDescription, ctx.request.files.topicAvatar)
		const referrer = body.referrer || '/secure'
		return ctx.redirect(`${referrer}?msg=topic has been added...`)
	} catch(err){
		console.log("ADDING ERROR: " + err)
		ctx.hbs.msg = err.message
		await ctx.render('secure', ctx.hbbs) // TODO probably
	} finally{
		// TODO
	}

})


export default router
