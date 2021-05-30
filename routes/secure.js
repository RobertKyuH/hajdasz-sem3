
import Router from 'koa-router'
import TextAreaMarkdown from 'textarea-markdown'

const router = new Router({ prefix: '/secure' })

// adding custom textarea which can handle markdown TODO
//let textarea = document.querySelector("#topicDescription");
//new TextareaMarkdown(textarea);
//

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}

router.use(checkAuth)

router.get('/', async ctx => {
	try {
		await ctx.render('secure', ctx.hbs)
	} catch(err) {
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})

export default router
