import { Pipe } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'

@Pipe({ name: 'innerHTML', standalone: true })
export class InnerHtml {
  constructor(public sanitizer: DomSanitizer) { }
  transform = (html: string) => this.sanitizer.bypassSecurityTrustHtml(html)
}