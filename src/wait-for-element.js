import {newMutationObserver, getDocument, getSetImmediate} from './helpers'

function waitForElement(
  callback,
  {
    container = getDocument(),
    timeout = 4500,
    mutationObserverOptions = {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    },
  } = {},
) {
  return new Promise((resolve, reject) => {
    if (typeof callback !== 'function') {
      reject(
        new Error('waitForElement requires a callback as the first parameter'),
      )
      return
    }
    let lastError
    const timer = setTimeout(onTimeout, timeout)
    const observer = newMutationObserver(onMutation)
    observer.observe(container, mutationObserverOptions)
    function onDone(error, result) {
      const setImmediate = getSetImmediate()
      clearTimeout(timer)
      setImmediate(() => observer.disconnect())
      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    }
    function onMutation() {
      try {
        const result = callback()
        if (result) {
          onDone(null, result)
        }
        // If `callback` returns falsy value, wait for the next mutation or timeout.
      } catch (error) {
        // Save the callback error to reject the promise with it.
        lastError = error
        // If `callback` throws an error, wait for the next mutation or timeout.
      }
    }
    function onTimeout() {
      onDone(lastError || new Error('Timed out in waitForElement.'), null)
    }
    onMutation()
  })
}

export {waitForElement}
