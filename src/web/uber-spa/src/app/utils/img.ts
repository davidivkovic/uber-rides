import { Pipe, PipeTransform } from '@angular/core'
import { baseUrl } from '@app/api'

@Pipe({
  name: 'IMG',
  standalone: true,
  pure: true
})
export class IMG implements PipeTransform {
  transform(imageUrl: string): any {
    if (imageUrl?.includes('localhost:8000')) {
      return imageUrl.replace('localhost:8000', baseUrl)
    }
    return imageUrl
  }
}