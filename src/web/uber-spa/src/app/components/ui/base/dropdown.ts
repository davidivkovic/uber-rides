import { NgFor, NgIf } from '@angular/common'
import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { RouterModule } from '@angular/router'
import { InnerHtml } from '@app/utils'

@Component({
  selector: 'Dropdown',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, InnerHtml],
  template: `
    <div #root class="relative inline-block text-left">
      <div>
        <button (click)="toggleMenu()" type="button" class="transition inline-flex w-full justify-center rounded-md bg-[#f1f1f1] px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 ring-black" id="menu-button" aria-expanded="true" aria-haspopup="true">
          Actions
          <svg class="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div 
        *ngIf="isOpen"
        class="absolute right-0 z-10 mt-2 w-fit origin-top-right rounded-md shadow-lg bg-[#f6f6f6] focus:outline-none text-sm" 
        role="menu" 
        aria-orientation="vertical" 
        aria-labelledby="menu-button" 
        tabindex="-1"
      >
        <div role="none" class="py-1 w-full">
          <ng-container *ngFor="let item of items; index as index;">
            <a 
              *ngIf="item.url"
              [id]="'menu-item-' + index"
              [routerLink]="item.url"
              [queryParams]="item.query"
              class="hover:bg-gray-200 group flex items-center pl-4 pr-5 py-3 w-full" 
              role="menuitem" 
              tabindex="-1" 
            >
              <div [innerHTML]="item.icon | innerHTML" class="mr-3"></div>
              {{ item.label }}
            </a>
            <button
              *ngIf="item.action"
              (click)="actionAndClose(item.action)"
              [id]="'menu-item-' + index"
              class="hover:bg-gray-200 group flex items-center pl-4 pr-5 py-3 rounded-none text-sm w-full" 
              role="menuitem" 
              tabindex="-1" 
            >
              <div [innerHTML]="item.icon | innerHTML" class="mr-3"></div>
              {{ item.label }}
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export default class Dropdown {

  @ViewChild('root') root: ElementRef<HTMLDivElement>
  @Input() items: {
    label: string
    icon: string
    url?: string
    query?: { [key: string]: any }
    action?: () => void
  }[] = []

  isOpen = false
  focusTrapped = false

  toggleMenu = () => {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      document.addEventListener('focus', this.focusChange, { capture: true })
      document.addEventListener('click', this.clickOutside, { capture: true })
    } else {
      document.addEventListener('focus', this.focusChange, { capture: true })
      document.removeEventListener('click', this.clickOutside, { capture: true })
    }
  }

  focusChange = () => this.isOpen && !this.root.nativeElement.contains(document.activeElement) && this.toggleMenu()

  clickOutside = e => {
    if (!this.root?.nativeElement.contains(e.target)) {
      this.toggleMenu()
    }
  }

  actionAndClose = (action: () => void) => {
    action()
    this.toggleMenu()
  }

}