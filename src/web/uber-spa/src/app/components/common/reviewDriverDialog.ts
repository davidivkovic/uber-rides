import { NgClass, NgFor, NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import trips from '@app/api/trips'
import { Dialog } from '../ui/dialog'
import DriverDetails from "./driverDetails"

@Component({
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule, DriverDetails],
  template: `
    <div id="review-driver-dialog" *ngIf="!success" class="w-[380px] h-[500px] flex flex-col p-1">
      <h1 class="text-2xl mb-2">Review a Ride</h1>
      <div class="flex items-center">
        <DriverDetails [driver]="props.trip.driver" [large]="true" class="mb-3"></DriverDetails>
        <div [title]="props.trip.car.type.name" class="flex items-center -mt-6">
          <div class="w-px h-[52px] bg-neutral-200 mx-3.5 mt-3.5"></div>
          <div>
            <img [src]="props.trip.car.type.image" class="w-[55px] ml-3"/>
            <h3 class="-mt-4 w-fit text-[12px] tracking-wide px-1.5 py-[0.5px] rounded bg-[#eeeeee] whitespace-nowrap">
              {{ props.trip.car.registration.replace('-', ' • ') }}
            </h3>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-x-1 mt-0.5">
        <h3 class="text-[15px]">Rating</h3>
        <p class="text-sm text-gray-500 pt-0.5">(required)</p>
      </div>
      <div *ngFor="let rating of ratings; index as index;" class="flex w-44 mt-2">
        <p class="mr-auto text-sm font-medium">{{ rating.name }}</p>
        <div class="star-rating flex">
          <button 
            *ngFor="let star of stars; index as starValue" 
            (click)="setRating(index, starValue + 1)"
            class="py-0 px-0.5"
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-5 w-5 cursor-pointer"
              [ngClass]="{
                'text-black': rating.value > starValue
              }"
            >
              <path
                fill-rule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex items-center gap-x-1 mt-4 mb-1.5">
        <h3 class="text-[15px]">Comment</h3>
        <p class="text-sm text-gray-500">(optional)</p>
      </div>
      <textarea 
        id="review-driver" 
        class="h-[135px] resize-none text-sm" 
        maxlength="240" 
        placeholder="Leave your comment here"
        [(ngModel)]="comment"
      ></textarea>
      <button 
        [disabled]="ratings[0].value === 0 || ratings[1].value === 0"
        (click)="submit()" 
        class="block w-full primary mb-1 mt-auto"
      >
        Confirm
      </button>
      <button (click)="close()" class="block w-full secondary">
        {{ props.tripJustEnded ? 'Maybe Later' : 'Cancel' }}
      </button>
    </div>
    <div *ngIf="success" class="w-[380px] h-[500px] flex flex-col p-1">
      <h1 class="text-2xl">Success</h1>
      <p>Thank you for leaving a review</p>
      <button (click)="close()" class="block w-full secondary mt-auto">Finish</button>
    </div>
  `
})
export default class ReviewDriverDialog extends Dialog {
  success = false
  stars = Array(5)
  ratings = [{ name: 'Driver', value: 0 }, { name: 'Car', value: 0 }]
  comment = ''

  setRating = (index: number, value: number) => {
    this.ratings[index].value = value
    window.detector.detectChanges()
  }

  async submit() {
    window.detector.detectChanges()
    try {
      await trips.reviewTrip(
        this.props.trip.id,
        (this.ratings[0].value + this.ratings[1].value) / 2,
        this.comment
      )
      this.success = true
    }
    catch (e) {
      console.log(e)
    }
  }
}