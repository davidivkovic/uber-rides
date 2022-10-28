const classNames = (...classes: (string | boolean)[]) => classes.filter(Boolean).join(' ')

export { classNames }