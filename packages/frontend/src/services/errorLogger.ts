export class ErrorLogger {
  static log(error: Error, errorInfo?: any) {
    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      // TODO: Integrate with error tracking service
      console.error('Production error:', error, errorInfo)
    } else {
      console.error('Development error:', error, errorInfo)
    }
  }
}