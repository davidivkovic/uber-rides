import { Component } from '@angular/core'
import { ridesStore } from '@app/stores'
import { InnerHtml } from '@app/utils'
import { NgIf } from '@angular/common'
import { watch } from 'usm-mobx'

const voiceover = new window.SpeechSynthesisUtterance()
let canSpeak = false

window.speechSynthesis.onvoiceschanged = e => {
  if (!voiceover.voice || voiceover.voice.lang !== 'en-US') {
    voiceover.voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google US English')
    canSpeak = true
  }
}

@Component({
  selector: 'Navigation',
  standalone: true,
  imports: [NgIf, InnerHtml],
  template: `
    <div class="flex items-center gap-x-2.5 transition-all duration-500" [style]="{ opacity }" >
      <div class="!basis-6 !w-6">
        <svg *ngIf="direction === 'straight'" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="16" y1="9" x2="12" y2="5"></line>
          <line x1="8" y1="9" x2="12" y2="5"></line>
        </svg>
        <svg *ngIf="direction === 'left'" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M13 3h-5v5"></path>
          <path d="M8 3l7.536 7.536a5 5 0 0 1 1.464 3.534v6.93"></path>
        </svg>
        <svg *ngIf="direction === 'right'" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 3h5v5"></path>
          <path d="M17 3l-7.536 7.536a5 5 0 0 0 -1.464 3.534v6.93"></path>
        </svg>
      </div>
      <div 
        [innerHTML]="instructions | innerHTML" 
        class="text-lg"
      >
      </div>
  </div>
  `
})
export default class Navigation {
  instructions = ''
  timeout: any = null
  opacity = 0
  direction = ''
  sound = new Audio('/assets/sounds/navigation.wav')
  constructor() {
    watch(
      ridesStore,
      () => ridesStore.data?.instructions,
      (curr, prev) => {
        this.opacity = 0
        if (curr.includes('right') || curr.includes('east')) this.direction = 'right'
        else if (curr.includes('left') || curr.includes('west')) this.direction = 'left'
        else this.direction = 'straight'
        this.instructions = curr
        this.opacity = 1

        if (canSpeak) {
          voiceover.text = curr.replace(/<[^>]*>/g, '')
          window.speechSynthesis.speak(voiceover)
        }

        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.opacity = 0
          this.timeout = null
        }, 15000)
      }
    )
  }
}