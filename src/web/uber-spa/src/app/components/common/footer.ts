import { Component } from '@angular/core'

@Component({
  selector: 'Footer',
  standalone: true,
  template: `
    <div id="footer" class="bg-black h-14 w-full flex items-center">
      <div class="w-[1280px] mx-auto flex items-center h-full">
        <p class="text-gray-300 text-[11px]">© 2022 Uber Technologies Inc.</p>
      </div>
    </div>
  `
})
export default class Footer { }
