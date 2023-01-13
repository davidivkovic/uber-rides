import { ChangeDetectionStrategy, Component } from '@angular/core'
import { NgFor } from '@angular/common'
import { ActivatedRoute, RouterModule } from '@angular/router'
// import { getAllChats } from '@app/api/chat'
import { PanelItem } from './panelItem'
import { chatStore } from '@app/stores'

@Component({
  standalone: true,
  selector: 'Panel',
  imports: [PanelItem, NgFor, RouterModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="w-80 flex-1 flex flex-col border-r-[1px] h-full">
      <div class="h-[95px] p-6">
        <h1 class="text-2xl">Conversations</h1>
        <p class="text-gray-500 text-sm">Help out your customers</p>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div *ngFor="let conversation of chatStore.allConversationsSorted; trackBy: ngForIdentity">
          <div class="w-full" [class]="{ 'bg-gray-100': conversation.id == activeConversationId }">
            <PanelItem [conversation]="conversation"> </PanelItem>
          </div>
        </div>
      </div>
    </div> 
  `
})
export class Panel {
  activeConversationId = ''

  chatStore = chatStore

  constructor(public route: ActivatedRoute) {
    chatStore.fetchAllConversations()
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.activeConversationId = params.get('id')
    })
  }

  ngForIdentity = (item: any) => item.id
}
