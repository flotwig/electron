import { ipcRendererInternal } from '@electron/internal/renderer/ipc-renderer-internal'
import * as errorUtils from '@electron/internal/common/error-utils'

type IPCHandler = (event: Electron.IpcRendererEvent, ...args: any[]) => any

export const handle = function <T extends IPCHandler> (channel: string, handler: T) {
  ipcRendererInternal.on(channel, async (event, requestId, ...args) => {
    const replyChannel = `${channel}_RESPONSE_${requestId}`
    try {
      event.sender.send(replyChannel, [null, await handler(event, ...args)])
    } catch (error) {
      event.sender.send(replyChannel, [errorUtils.serialize(error)])
    }
  })
}

export const invoke = ipcRendererInternal.invoke

export function invokeSync<T> (command: string, ...args: any[]): T {
  const [ error, result ] = ipcRendererInternal.sendSync(command, ...args)

  if (error) {
    throw errorUtils.deserialize(error)
  } else {
    return result
  }
}
