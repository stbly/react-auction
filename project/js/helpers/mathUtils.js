const getRandomNumber = (min, max) => Math.random() * (max - min) + min

const getRandomString = (length) => Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1)

export { getRandomNumber, getRandomString }
