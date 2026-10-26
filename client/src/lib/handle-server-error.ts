import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number((error as { status: unknown }).status) === 204
  ) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    const serverData = error.response?.data
    if (typeof serverData === 'string') {
      errMsg = serverData
    } else if (serverData && typeof serverData === 'object') {
      errMsg = serverData.title || serverData.message || errMsg
    }
  }

  toast.error(errMsg)
}