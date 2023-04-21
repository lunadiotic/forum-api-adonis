import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Thread from 'App/Models/Thread'
import ThreadValidator from 'App/Validators/ThreadValidator'

export default class ThreadsController {
  public async index({ response }: HttpContextContract) {
    try {
      const threads = await Thread.query().preload('category').preload('user')
      return response.status(200).json({
        data: threads,
      })
    } catch (error) {
      return response.status(400).json({
        message: error.messages,
      })
    }
  }
  public async store({ request, auth, response }: HttpContextContract) {
    const validateData = await request.validate(ThreadValidator)

    try {
      const thread = await auth.user?.related('threads').create(validateData)
      await thread?.load('category')
      await thread?.load('user')

      return response.status(201).json({
        data: thread,
      })
    } catch (error) {
      return response.status(400).json({
        message: error.messages,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    try {
      const thread = await Thread.query()
        .where('id', params.id)
        .preload('category')
        .preload('user')
        .firstOrFail()

      return response.status(200).json({
        data: thread,
      })
    } catch (error) {
      return response.status(404).json({
        message: 'Thread not found',
      })
    }
  }

  public async update({ params, request, response }: HttpContextContract) {
    try {
      const thread = await Thread.findOrFail(params.id)
      const validateData = await request.validate(ThreadValidator)

      await thread.merge(validateData).save()

      await thread?.load('category')
      await thread?.load('user')

      return response.status(200).json({
        data: thread,
      })
    } catch (error) {
      return response.status(404).json({
        message: error,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    try {
      const thread = await Thread.findOrFail(params.id)
      await thread.delete()
      return response.status(200).json({
        message: 'Thread deleted successfully',
      })
    } catch (error) {
      return response.status(500).json({
        message: error,
      })
    }
  }
}
