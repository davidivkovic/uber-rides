const throttle = (callback: any, delay = 250) => {
  let shouldWait = false
  let waitingArgs: any
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } else {
      callback(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    callback(...args)
    shouldWait = true
    setTimeout(timeoutFunc, delay)
  }
}

const debounce = (callback: any, delay = 250) => {
  let timeout: any
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

export { throttle, debounce }