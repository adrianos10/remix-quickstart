import {createPost, getPost, Post} from '~/post'
import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'

type PostError = {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export const loader: LoaderFunction = ({params}) => {
  invariant(params.slug, 'slug should be a string')
  return getPost(params.slug)
}

export const action: ActionFunction = async ({request}) => {
  const formData = await request.formData()

  const title = formData.get('title')
  const slug = formData.get('slug')
  const markdown = formData.get('markdown')

  const errors: PostError = {}

  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true

  if (Object.keys(errors).length) {
    return errors
  }

  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')

  await createPost({title, slug, markdown})

  return redirect('/admin')
}

export default function EditPost() {
  const errors = useActionData()
  const transition = useTransition()
  const {html, slug, title} = useLoaderData<Post>()

  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {errors?.title ? <em>Title is required</em> : null}
          <input type="text" name="title" defaultValue={title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}
          <input type="text" name="slug" defaultValue={slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">
          Markdown: {errors?.markdown ? <em>Markdown is required</em> : null}
        </label>
        <br />
        <textarea key={slug} rows={20} name="markdown" defaultValue={html} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Editting...' : 'Edit post'}
        </button>
      </p>
    </Form>
  )
}
