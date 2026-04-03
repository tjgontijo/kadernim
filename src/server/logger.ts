type LogContext = Record<string, unknown>

function writeLog(level: 'info' | 'warn' | 'error', context: LogContext, message: string) {
  const payload = {
    level,
    message,
    ...context,
    timestamp: new Date().toISOString(),
  }

  const line = JSON.stringify(payload)

  if (level === 'error') {
    console.error(line)
    return
  }

  if (level === 'warn') {
    console.warn(line)
    return
  }

  console.info(line)
}

export const logger = {
  info(context: LogContext, message: string) {
    writeLog('info', context, message)
  },
  warn(context: LogContext, message: string) {
    writeLog('warn', context, message)
  },
  error(context: LogContext, message: string) {
    writeLog('error', context, message)
  },
}
