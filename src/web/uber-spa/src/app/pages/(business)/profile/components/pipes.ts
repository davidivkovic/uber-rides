import { Pipe } from "@angular/core"

@Pipe({ standalone: true, name: 'cardNumber' })
export class CardNumber {
  transform = (number: string) =>
    number
      .replace(/\s+/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
}

@Pipe({ standalone: true, name: 'cardNumberHidden' })
export class CardNumberHidden {
  transform = (number: string) => {
    number = number.slice(0, 5) + number.slice(5).replace(/[0-9]/g, '*').trim()
    return number
  }
}

@Pipe({ standalone: true, name: 'expDate' })
export class Date {
  transform = (date: string) => ((date.length > 1 && !date.includes('/')) ? date.slice(0, 2) + '/' + date.slice(2) : date)
}