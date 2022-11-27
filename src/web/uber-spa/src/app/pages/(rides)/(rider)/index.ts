import { Component } from '@angular/core'
import { NgClass, NgFor, NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { init } from '@app/api/google-maps'
import { computed } from '@app/utils'

@Component({
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule],
  template: `
    <div class="h-full relative">
      <div id="gooogle-map" class="absolute w-full h-full"></div>
      <div class="h-full w-full absolute z-10 pointer-events-none">
        <div class="max-w-7xl mx-auto w-full h-full flex items-center px-5">
          <div class="max-h-[700px] w-[400px] h-full bg-white pointer-events-auto rounded-xl p-[18px]">
            <h1 class="text-4xl transition">{{ cardTitle() }}</h1>
            <div class="mt-4">
              <ng-container *ngFor="let stopover of stopoverInputs; index as index; trackBy: ngForIdentity">
                <div class="flex items-center mb-4">
                  <div class="relative w-full group">
                    <input 
                      type="text"
                      autocomplete="off"
                      spellcheck="false"
                      [id]="'stopover-input-' + index"
                      [placeholder]="
                        index === 0 ? 'Add pickup location' :
                        index === stopoverInputs.length - 1 ? 'Enter destination' : 'Add stop'
                      "
                      [(ngModel)]="stopover.address"
                      (focus)="focusStopoverInput(index)"
                      (blur)="unFocusStopoverInput()"
                      class="pl-16 placeholder:text-[15px] text-base"
                    />
                  </div>
                  <button 
                    *ngIf="stopoverInputs.length > 2"
                    (click)="removeStop(index)"
                    class="px-1 py-2 ml-1 -mr-2" 
                    tabindex="-1"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
                <div 
                  *ngIf="index !== stopoverInputs.length - 1" 
                  class="absolute -mt-10 ml-8 z-10"
                >
                  <div class="w-1.5 h-1.5 border-2 border-black rounded-full group-hover:w-10"></div>
                  <div class="w-[2px] h-11 ml-[2px] my-[5px] bg-black"></div>
                  <div class="w-1.5 h-1.5 border-2 border-black rounded-full"></div>
                </div>
              </ng-container>
              <div 
                class="flex items-start justify-end -mt-1 space-x-1"
                [ngClass]="{ 'mr-5' : stopoverInputs.length > 2 }"
              >
                <button 
                  (mousedown)="moveStop($event, 'up')"
                  [ngClass]="{ 'opacity-30 cursor-default hover:!bg-[#eeeeee]' : !canMoveStopUp() }"
                  class="secondary rounded-full p-1.5 hover:bg-zinc-200"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="16" y1="9" x2="12" y2="5"></line>
                    <line x1="8" y1="9" x2="12" y2="5"></line>
                  </svg>
                </button>
                <button  
                  (mousedown)="moveStop($event, 'down')"
                  [ngClass]="{ 'opacity-30 cursor-default hover:!bg-[#eeeeee]' : !canMoveStopDown() }"
                  class="secondary rounded-full p-1.5 hover:bg-zinc-200"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="16" y1="15" x2="12" y2="19"></line>
                    <line x1="8" y1="15" x2="12" y2="19"></line>
                  </svg>
                </button>
                <button 
                  *ngIf="stopoverInputs.length < 5"
                  (click)="addStop()"
                  class="flex items-center secondary rounded-full px-4 !py-px !text-sm whitespace-nowrap"
                >
                  Add stop<span class="text-2xl ml-2">+</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export default class Index {

  stopoverInputs: { address: string }[] = [
    { address: '' },
    { address: '' }
  ]
  /* 
    -2 -> initial value
    -1 -> empty value
     n -> focused n-th stopover
  */
  focusedStopover = -2

  cardTitle = computed(
    () => this.focusedStopover,
    previous => {
      const id = this.focusedStopover
      if (id === -1) return previous
      if (id <= 0) return 'Where can we pick you up?'
      if (id === this.stopoverInputs.length - 1) return 'Where are you heading to?'
      return 'Where are we stopping at?'
    }
  )

  focusStopoverInput = (id: number) => this.focusedStopover = id

  unFocusStopoverInput = () => this.focusedStopover = -1

  addStop = () => {
    const length = this.stopoverInputs.length
    this.stopoverInputs.splice(length - 1, 0, { address: '' })
  }

  removeStop = (index: number) => this.stopoverInputs.splice(index, 1)

  canMoveStopUp = computed(
    () => this.focusedStopover,
    () => this.focusedStopover > 0
  )
  canMoveStopDown = computed(
    () => this.focusedStopover,
    () => this.focusedStopover >= 0 && this.focusedStopover < this.stopoverInputs.length - 1
  )

  moveStop = (event: MouseEvent, direction: 'up' | 'down') => {
    event.preventDefault()
    let index = this.focusedStopover
    const stop = this.stopoverInputs[index]

    if (direction == 'up') {
      if (!this.canMoveStopUp()) return
      this.stopoverInputs.splice(index, 1)
      index--
    }
    else if (direction === 'down') {
      if (!this.canMoveStopDown()) return
      this.stopoverInputs.splice(index, 1)
      index++
    }

    this.stopoverInputs.splice(index, 0, stop)
    document.getElementById('stopover-input-' + index)?.focus()
  }

  ngForIdentity = (index: number, item: any) => index

  ngAfterViewInit() {
    init('gooogle-map')
  }
}