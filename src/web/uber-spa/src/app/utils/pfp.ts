import { Pipe, PipeTransform } from '@angular/core'
import { baseUrl, scheme } from '@app/api'

@Pipe({
  name: 'PFP',
  standalone: true,
  pure: true
})
export class PFP implements PipeTransform {
  transform(profilePicture: string): any {
    if (profilePicture?.startsWith('http')) return profilePicture
    else if (profilePicture?.startsWith('/users/')) return scheme + baseUrl + profilePicture
    return scheme + baseUrl + '/users/pictures/' + profilePicture
  }
}